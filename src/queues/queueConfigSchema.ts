// JSON schema
export default {
	type: 'object',
	properties: {
		appName: {
			type: 'string'
		},
		defaultQueueConfig: {
			type: 'object',
			properties: {
				exchange: { type: 'string' },
				deferredExchange: { type: 'string' },
				deadLetterExchange: { type: 'string' },
				durable: { type: 'boolean' },
				ack: { type: 'boolean' }
			},
			required: [
				'exchange',
				'deadLetterExchange',
				'deferredExchange',
				'durable',
				'ack'
			],
			additionalProperties: false
		},
		queues: {
			type: 'object'
		}
	},
	required: ['appName', 'defaultQueueConfig', 'queues'],
	additionalProperties: false
};
