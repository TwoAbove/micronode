/// <reference types="node" />
import { EventEmitter } from 'events';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { Message } from 'amqplib';
import { IFullQueueConfig } from './queueConfig';
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
    private name;
    private appName;
    private config;
    private globalEmit;
    private getConnection;
    private key;
    private consumerTag;
    private concurrency;
    private channelEstablished;
    private listening;
    private connected;
    private shouldStartConsuming;
    private channelWrapper;
    private validateMessageBody;
    private worker;
    constructor(name: string, appName: string, config: IFullQueueConfig, globalEmit: (event: string | symbol, ...args: any[]) => boolean, getConnection: () => AmqpConnectionManager);
    private setupChannel;
    listen(worker: (message: IMessage) => void, concurrency?: number): Promise<void>;
    private addConsumeSetup;
    stopListening(): Promise<boolean>;
    publish(body: any, properties?: any): Promise<void>;
    getChannel(): ChannelWrapper;
    messageHandler(originalMessage: Message | null): void;
    complexEmit(eventName: string, ...props: any[]): void;
}
export default BaseQueue;
