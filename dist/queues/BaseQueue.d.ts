/// <reference types="node" />
import { EventEmitter } from 'events';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { IQueueConfig } from './queueConfig';
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
declare class BaseQueue extends EventEmitter {
    private config;
    private name;
    private appName;
    private key;
    private consumerTag;
    private concurrency;
    private channelEstablished;
    private listening;
    private connected;
    private shouldStartConsuming;
    private channelWrapper;
    private validateMessageBody;
    private globalEmit;
    private getConnection;
    private worker;
    constructor(name: string, appName: string, config: IQueueConfig, globalEmit: (event: string | symbol, ...args: any[]) => boolean, getConnection: () => AmqpConnectionManager);
    private setupChannel;
    listen(worker: (message: IMessage) => void, concurrency?: number): Promise<void>;
    private addConsumeSetup;
    stopListening(): Promise<boolean>;
    publish(body: any, properties?: any): Promise<void>;
    getChannel(): ChannelWrapper;
    messageHandler(originalMessage: any): void;
    complexEmit(eventName: any, ...props: any[]): void;
}
export default BaseQueue;
//# sourceMappingURL=BaseQueue.d.ts.map