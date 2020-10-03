"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const events_1 = require("events");
const ajv_1 = __importDefault(require("ajv"));
const deserialize_1 = __importDefault(require("./deserialize"));
const serialize_1 = __importDefault(require("./serialize"));
// const createAmqpConfiguration = require('./createAmqpConfiguration');
const ajv = new ajv_1.default({ allErrors: true });
const randomString = () => Math.random()
    .toString(36)
    .substr(2, 10);
class BaseQueue extends events_1.EventEmitter {
    constructor(name, appName, config, globalEmit, getConnection) {
        super();
        this.name = name;
        this.appName = appName;
        this.config = config;
        this.globalEmit = globalEmit;
        this.getConnection = getConnection;
        this.channelEstablished = false;
        this.listening = false;
        this.connected = false;
        this.key = `${appName}.${name}`;
        this.validateMessageBody = ajv.compile(config.messageBodySchema);
        this.setupChannel();
    }
    setupChannel() {
        const name = this.name;
        const config = this.config;
        const key = this.key;
        const connection = this.getConnection();
        this.channelWrapper = connection.createChannel({
            // json: true,
            setup: async function (channel) {
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
    listen(worker, concurrency = 1) {
        assert_1.default(!this.listening, 'Should only start listening one time');
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
    addConsumeSetup() {
        this.getChannel().addSetup(async (channel) => {
            if (this.config.ack) {
                await channel.prefetch(this.concurrency);
            }
            const consume = await channel.consume(this.name, this.messageHandler.bind(this), {
                noAck: !this.config.ack
            });
            this.consumerTag = consume.consumerTag;
            this.listening = true;
        });
    }
    stopListening() {
        assert_1.default(this.listening === true, 'Tried to cancel listening but it was not started');
        return this.getChannel()
            .addSetup((channel) => channel.cancel(this.consumerTag))
            .then(() => {
            this.listening = false;
            return true;
        });
    }
    publish(body, properties = {}) {
        assert_1.default(this.validateMessageBody(body), ajv.errorsText(this.validateMessageBody.errors));
        const { content, contentType } = serialize_1.default(body);
        const options = {
            persistent: true,
            contentType,
            messageId: randomString(),
            timestamp: Math.floor(new Date().getTime() / 1000),
            appId: this.appName
        };
        const allowedProperties = ['priority', 'correlationId', 'messageId', 'type'];
        allowedProperties.forEach(property => {
            if (properties[property]) {
                options[property] = properties[property];
            }
        });
        let exchange = this.config.exchange;
        if (properties.defer) {
            if (!this.config.deferredExchange) {
                throw new Error(`Can't defer on ${this.name}: feature not supported by configuration`);
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
        const body = deserialize_1.default(content, properties.contentType);
        const message = {
            body,
            priority: properties.priority,
            correlationId: properties.correlationId,
            messageId: properties.messageId,
            timestamp: typeof properties.timestamp === 'number'
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
        }
        else {
            message.ack = () => {
                throw new Error('Can not ack or nack because queue is created with <ack> = false');
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
exports.default = BaseQueue;
//# sourceMappingURL=BaseQueue.js.map