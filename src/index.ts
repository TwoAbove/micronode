import assert from 'assert';
import { EventEmitter } from 'events';
import Ajv from 'ajv';

import queueConfigSchema from './queues/queueConfigSchema';
import {
	IQueueHandlerConfig,
	IQueueConfig, IFullQueueConfig
} from './queues/queueConfig';
import BaseQueue, { IMessage } from './queues/BaseQueue';

import amqp, { AmqpConnectionManager } from 'amqp-connection-manager';

const DISCONNECT_TIMEOUT = 60 * 1000;
// const RABBIT_MQ_CONNECT_STRING = process.env.RABBIT_MQ_CONNECT_STRING as string;

function validateConfig(config: IQueueHandlerConfig) {
	const ajv = new Ajv();
	const validate = ajv.compile(queueConfigSchema);
	const valid = validate(config);
	assert(valid, ajv.errorsText(validate.errors));
	return { valid, errors: validate.errors };
}

export class QueueHandler<T = Record<string, any>> extends EventEmitter {
	private connection!: AmqpConnectionManager;
	private disconnectTimeoutHandler?: NodeJS.Timer;
	public queues!: Record<keyof T, BaseQueue>;

	/**
	* Creates a queue handler. The config should be consistent throughout initialized handlers.
	* @param config {IQueueHandlerConfig}
	*/
	constructor(private readonly config: IQueueHandlerConfig, private readonly connectionUrls: string[]) {
		super();

		const configValidationResult = validateConfig(config);
		assert(
			configValidationResult.valid,
			'config invalid: ' + configValidationResult.errors
		);

		assert(
			Array.isArray(connectionUrls),
			'<connectionUrls> must be an array of strings'
		);
		assert(connectionUrls.length, '<connectionUrls> array must not be empty');

		this.buildApi();
	}

	public buildApi() {
		for (const queueName of Object.keys(this.config.queues)) {
			const config = this.config.queues[queueName];
			const defaultConfig = this.config.defaultQueueConfig;
			const builtConfig = {
				...defaultConfig,
				...config
			};
			// TODO: Get this type working
			(this.queues as any)[queueName] = new BaseQueue(
				queueName,
				this.config.appName,
				builtConfig,
				this.emit.bind(this),
				() => this.getConnection()
			);
		}
	}

	public getConnection() {
		if (this.connection) {
			return this.connection;
		}
		this.connection = amqp.connect(this.connectionUrls);
		this.connection.on('connect', connection => {
			this.emit('connect', connection);
			if (this.disconnectTimeoutHandler) {
				clearTimeout(this.disconnectTimeoutHandler);
				this.disconnectTimeoutHandler = undefined;
			}
		});

		this.connection.on('disconnect', error => {
			if (!this.disconnectTimeoutHandler) {
				this.disconnectTimeoutHandler = setTimeout(() => {
					this.emit('disconnect', error.err);
				}, DISCONNECT_TIMEOUT);
			}
		});

		return this.connection;
	}

	public closeConnection() {
		if (this.connection && this.connection.isConnected()) {
			this.connection.close();
		}
	}
}

// const defaultQueueHandler = new QueueHandler(defaultConfig, [
// 	RABBIT_MQ_CONNECT_STRING
// ]);

export default QueueHandler;
export {
	IQueueHandlerConfig,
	IQueueConfig,
	IMessage,
}
