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
	queues: { [key: string]: Partial<IQueueConfig> };
}

// const defaultConfig: IQueueHandlerConfig = {
// 	defaultQueueConfig: {
// 		exchange: 'pricemon',
// 		deferredExchange: 'pricemon-deferred',
// 		deadLetterExchange: 'x-dead-pricemon',
// 		durable: false,
// 		ack: true
// 	},
// 	queues: {
// 		'email-verification': {
// 			durable: true,
// 			ack: true,
// 			messageBodySchema: {
// 				type: 'object',
// 				properties: {
// 					flowId: { type: 'string' },
// 					user: { type: 'object' },
// 					linkUrl: { type: 'string' }
// 				},
// 				required: ['flowId']
// 			}
// 		},
// 		// 'email-update': {}
// 	}
// };

// export default defaultConfig;
