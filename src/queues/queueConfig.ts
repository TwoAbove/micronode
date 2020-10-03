export interface IDefaultQueueConfig {
	exchange: string;
	deferredExchange: string;
	deadLetterExchange: string;
	durable: boolean;
	ack: boolean;
}

export type IQueueConfig = {
	messageBodySchema: any;
} & Partial<IDefaultQueueConfig>;

export type IFullQueueConfig = Required<IDefaultQueueConfig> & IQueueConfig;

export interface IQueueHandlerConfig {
	appName: string;
	defaultQueueConfig: IDefaultQueueConfig;
	queues: Record<string, IQueueConfig>;
}
