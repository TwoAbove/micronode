declare const _default: {
    type: string;
    properties: {
        appName: {
            type: string;
        };
        defaultQueueConfig: {
            type: string;
            properties: {
                exchange: {
                    type: string;
                };
                deferredExchange: {
                    type: string;
                };
                deadLetterExchange: {
                    type: string;
                };
                durable: {
                    type: string;
                };
                ack: {
                    type: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        queues: {
            type: string;
        };
    };
    required: string[];
    additionalProperties: boolean;
};
export default _default;
