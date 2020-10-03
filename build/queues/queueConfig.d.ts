export interface IQueueConfig {
    exchange: string;
    deferredExchange: string;
    deadLetterExchange: string;
    durable: boolean;
    ack: boolean;
    messageBodySchema: any;
}
export interface IQueueHandlerConfig {
    appName: string;
    defaultQueueConfig: Omit<IQueueConfig, 'messageBodySchema'>;
    queues: Record<string, Partial<IQueueConfig>>;
}
//# sourceMappingURL=queueConfig.d.ts.map