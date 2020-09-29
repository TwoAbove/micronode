import assert from 'assert';
import { EventEmitter } from 'events';
import Ajv from 'ajv';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, Options } from 'amqplib';
import { IQueueConfig } from './queueConfig';

import deserialize from './deserialize';
import serialize from './serialize';
// const createAmqpConfiguration = require('./createAmqpConfiguration');

const ajv = new Ajv({ allErrors: true });
const randomString = () =>
	Math.random()
		.toString(36)
		.substr(2, 10);

export interface IMessage {
	body: any;
	priority: any;
	correlationId: any;
	messageId: any;
	timestamp: Date | null;
	type: any;
	appId: any;
	key: any;
	redelivered: any;
	originalMessage: any;

	ack?: () => void;
	nack?: () => void;
}

class BaseQueue extends EventEmitter {
	private config: IQueueConfig;
	private name: string;
	private appName: string;
	private key: string;
	private consumerTag: string;
	private concurrency: number;
	private channelEstablished = false;
	private listening = false;
	private connected = false;
	private shouldStartConsuming: boolean;
	private channelWrapper: ChannelWrapper;
	private validateMessageBody: Ajv.ValidateFunction;

	private globalEmit: (event: string | symbol, ...args: any[]) => boolean;
	private getConnection: () => AmqpConnectionManager;
	private worker: (IMessage) => void;

	constructor(
		name: string,
		appName: string,
		config: IQueueConfig,
		globalEmit: (event: string | symbol, ...args: any[]) => boolean,
		getConnection: () => AmqpConnectionManager
	) {
		super();
		this.name = name;
		this.appName = appName;
		this.key = `${appName}.${name}`;
		this.config = config;
		this.getConnection = getConnection;
		this.globalEmit = globalEmit;
		this.validateMessageBody = ajv.compile(config.messageBodySchema);
		this.setupChannel();
	}

	private setupChannel() {
		const name = this.name;
		const config = this.config;
		const key = this.key;
		const connection = this.getConnection();
		this.channelWrapper = connection.createChannel({
			// json: true,
			setup: async function(channel: ConfirmChannel) {
				// console.log('channel', channel);
				// `channel` here is a regular amqplib `ConfirmChannel`.
				// Note that `this` here is the channelWrapper instance.
				await channel.assertExchange(config.exchange, 'topic', {
					durable: config.durable
				});
				await channel.assertExchange(config.deferredExchange, 'topic', {
					durable: config.durable
				});
				await channel.assertExchange(config.deadLetterExchange, 'topic', {
					durable: config.durable
				});

				await channel.assertQueue(name, {
					durable: config.durable,
					deadLetterExchange: config.deadLetterExchange
				});

				await channel.bindQueue(name, config.exchange, key);
			}
		});

		this.channelWrapper.on('error', err => {
			this.complexEmit('error', err);
		});

		this.channelWrapper.on('connect', () => {
			this.connected = true;
			this.complexEmit('connect');
			if (this.shouldStartConsuming) {
				this.addConsumeSetup();
			}
		});
		this.channelWrapper.on('disconnect', () => {
			this.connected = false;
			this.complexEmit('disconnect');
			if (this.shouldStartConsuming) {
				this.addConsumeSetup();
			}
		});

		this.channelEstablished = true;
	}

	public listen({ worker, concurrency = 1 }) {
		assert(!this.listening, 'Should only start listening one time');
		assert(typeof worker === 'function', 'Should provide a <worker> function');

		this.worker = worker;
		this.concurrency = concurrency;

		this.shouldStartConsuming = true;
		if (this.connected) {
			this.addConsumeSetup();
		}
		// @TODO: check if setup channel should be called
		// regardless of connection status
		this.setupChannel();
		return Promise.resolve();
	}

	private addConsumeSetup() {
		this.getChannel().addSetup(async (channel: ConfirmChannel) => {
			if (this.config.ack) {
				await channel.prefetch(this.concurrency);
			}
			const consume = await channel.consume(
				this.name,
				this.messageHandler.bind(this),
				{
					noAck: !this.config.ack
				}
			);
			this.consumerTag = consume.consumerTag;
			this.listening = true;
		});
	}

	public stopListening() {
		assert(
			this.listening === true,
			'Tried to cancel listening but it was not started'
		);

		return this.getChannel()
			.addSetup(channel => channel.cancel(this.consumerTag))
			.then(() => {
				this.listening = false;
				return true;
			});
	}

	publish(body, properties: any = {}) {
		assert(
			this.validateMessageBody(body),
			ajv.errorsText(this.validateMessageBody.errors)
		);

		const { content, contentType } = serialize(body);
		const options: Options.Publish = {
			persistent: true,
			contentType,
			messageId: randomString(),
			timestamp: Math.floor(new Date().getTime() / 1000), // To UNIX timestamp
			appId: this.appName
		};

		['priority', 'correlationId', 'messageId', 'type'].forEach(property => {
			if (properties[property]) {
				options[property] = properties[property];
			}
		});
		let exchange = this.config.exchange;
		if (properties.defer) {
			if (!this.config.deferredExchange) {
				throw new Error(
					`Can't defer on ${this.name}: feature not supported by configuration`
				);
			}
			exchange = this.config.deferredExchange;
			options.expiration = properties.defer;
		}
		return this.getChannel().publish(exchange, this.key, content, options);
	}

	getChannel() {
		if (this.channelEstablished) {
			return this.channelWrapper;
		}

		this.setupChannel();
		return this.channelWrapper;
	}

	messageHandler(originalMessage) {
		if (originalMessage === null) {
			this.complexEmit('error', new Error('Consumer was canceled by broker'));
			return;
		}

		const { content, fields, properties } = originalMessage;
		const body = deserialize(content, properties.contentType);
		const message: IMessage = {
			body,
			priority: properties.priority,
			correlationId: properties.correlationId,
			messageId: properties.messageId,
			timestamp:
				typeof properties.timestamp === 'number'
					? new Date(properties.timestamp * 1000)
					: null,
			type: properties.type,
			appId: properties.appId,
			key: fields.routingKey,
			redelivered: fields.redelivered,
			originalMessage
		};

		if (this.config.ack) {
			message.ack = () => this.getChannel().ack(originalMessage);
			message.nack = () => this.getChannel().nack(originalMessage);
		} else {
			message.ack = () => {
				throw new Error(
					'Can not ack or nack because queue is created with <ack> = false'
				);
			};
			message.nack = message.ack;
		}

		this.worker(message);
	}

	complexEmit(eventName, ...props) {
		this.emit(eventName, ...props);
		this.globalEmit(`${this.name}:${eventName}`, ...props);
	}
}

export default BaseQueue;
