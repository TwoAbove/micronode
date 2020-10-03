/// <reference types="node" />
import { EventEmitter } from 'events';
import { IQueueHandlerConfig, IQueueConfig } from './queues/queueConfig';
import BaseQueue, { IMessage } from './queues/BaseQueue';
import amqp from 'amqp-connection-manager';
export declare class QueueHandler<T = Record<string, any>> extends EventEmitter {
    private readonly config;
    private readonly connectionUrls;
    private connection;
    private disconnectTimeoutHandler?;
    queues: Record<keyof T, BaseQueue>;
    /**
    * Creates a queue handler. The config should be consistent throughout initialized handlers.
    * @param config {IQueueHandlerConfig}
    */
    constructor(config: IQueueHandlerConfig, connectionUrls: string[]);
    buildApi(): void;
    getConnection(): amqp.AmqpConnectionManager;
    closeConnection(): void;
}
export default QueueHandler;
export { IQueueHandlerConfig, IQueueConfig, IMessage, };
