"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const events_1 = require("events");
const ajv_1 = __importDefault(require("ajv"));
const queueConfigSchema_1 = __importDefault(require("./queues/queueConfigSchema"));
const BaseQueue_1 = __importDefault(require("./queues/BaseQueue"));
const amqp_connection_manager_1 = __importDefault(require("amqp-connection-manager"));
const DISCONNECT_TIMEOUT = 60 * 1000;
// const RABBIT_MQ_CONNECT_STRING = process.env.RABBIT_MQ_CONNECT_STRING as string;
function validateConfig(config) {
    const ajv = new ajv_1.default();
    const validate = ajv.compile(queueConfigSchema_1.default);
    const valid = validate(config);
    assert_1.default(valid, ajv.errorsText(validate.errors));
    return { valid, errors: validate.errors };
}
// type queueKeys = { [key: keyof IQueueHandlerConfig['queues']]: BaseQueue }
class QueueHandler extends events_1.EventEmitter {
    /**
    * Creates a queue handler. The config should be consistent throughout initialized handlers.
    * @param config {IQueueHandlerConfig}
    */
    constructor(config, connectionUrls) {
        super();
        this.config = config;
        this.connectionUrls = connectionUrls;
        this.queues = {};
        const configValidationResult = validateConfig(config);
        assert_1.default(configValidationResult.valid, 'config invalid: ' + configValidationResult.errors);
        assert_1.default(Array.isArray(connectionUrls), '<connectionUrls> must be an array of strings');
        assert_1.default(connectionUrls.length, '<connectionUrls> array must not be empty');
        this.buildApi();
    }
    buildApi() {
        for (const queueName of Object.keys(this.config.queues)) {
            const config = this.config.queues[queueName];
            const defaultConfig = this.config.defaultQueueConfig;
            const builtConfig = Object.assign(Object.assign({}, defaultConfig), config);
            this.queues[queueName] = new BaseQueue_1.default(queueName, this.config.appName, builtConfig, this.emit.bind(this), () => this.getConnection());
        }
    }
    getConnection() {
        if (this.connection) {
            return this.connection;
        }
        this.connection = amqp_connection_manager_1.default.connect(this.connectionUrls);
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
    closeConnection() {
        if (this.connection && this.connection.isConnected()) {
            this.connection.close();
        }
    }
}
exports.QueueHandler = QueueHandler;
// const defaultQueueHandler = new QueueHandler(defaultConfig, [
// 	RABBIT_MQ_CONNECT_STRING
// ]);
exports.default = QueueHandler;
//# sourceMappingURL=index.js.map