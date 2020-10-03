"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueHandler = void 0;
var assert_1 = __importDefault(require("assert"));
var events_1 = require("events");
var ajv_1 = __importDefault(require("ajv"));
var queueConfigSchema_1 = __importDefault(require("./queues/queueConfigSchema"));
var BaseQueue_1 = __importDefault(require("./queues/BaseQueue"));
var amqp_connection_manager_1 = __importDefault(require("amqp-connection-manager"));
var DISCONNECT_TIMEOUT = 60 * 1000;
// const RABBIT_MQ_CONNECT_STRING = process.env.RABBIT_MQ_CONNECT_STRING as string;
function validateConfig(config) {
    var ajv = new ajv_1.default();
    var validate = ajv.compile(queueConfigSchema_1.default);
    var valid = validate(config);
    assert_1.default(valid, ajv.errorsText(validate.errors));
    return { valid: valid, errors: validate.errors };
}
// type queueKeys = { [key: keyof IQueueHandlerConfig['queues']]: BaseQueue }
var QueueHandler = /** @class */ (function (_super) {
    __extends(QueueHandler, _super);
    /**
    * Creates a queue handler. The config should be consistent throughout initialized handlers.
    * @param config {IQueueHandlerConfig}
    */
    function QueueHandler(config, connectionUrls) {
        var _this = _super.call(this) || this;
        _this.config = config;
        _this.connectionUrls = connectionUrls;
        _this.queues = {};
        var configValidationResult = validateConfig(config);
        assert_1.default(configValidationResult.valid, 'config invalid: ' + configValidationResult.errors);
        assert_1.default(Array.isArray(connectionUrls), '<connectionUrls> must be an array of strings');
        assert_1.default(connectionUrls.length, '<connectionUrls> array must not be empty');
        _this.buildApi();
        return _this;
    }
    QueueHandler.prototype.buildApi = function () {
        var _this = this;
        for (var _i = 0, _a = Object.keys(this.config.queues); _i < _a.length; _i++) {
            var queueName = _a[_i];
            var config = this.config.queues[queueName];
            var defaultConfig = this.config.defaultQueueConfig;
            var builtConfig = __assign(__assign({}, defaultConfig), config);
            this.queues[queueName] = new BaseQueue_1.default(queueName, this.config.appName, builtConfig, this.emit.bind(this), function () { return _this.getConnection(); });
        }
    };
    QueueHandler.prototype.getConnection = function () {
        var _this = this;
        if (this.connection) {
            return this.connection;
        }
        this.connection = amqp_connection_manager_1.default.connect(this.connectionUrls);
        this.connection.on('connect', function (connection) {
            _this.emit('connect', connection);
            if (_this.disconnectTimeoutHandler) {
                clearTimeout(_this.disconnectTimeoutHandler);
                _this.disconnectTimeoutHandler = undefined;
            }
        });
        this.connection.on('disconnect', function (error) {
            if (!_this.disconnectTimeoutHandler) {
                _this.disconnectTimeoutHandler = setTimeout(function () {
                    _this.emit('disconnect', error.err);
                }, DISCONNECT_TIMEOUT);
            }
        });
        return this.connection;
    };
    QueueHandler.prototype.closeConnection = function () {
        if (this.connection && this.connection.isConnected()) {
            this.connection.close();
        }
    };
    return QueueHandler;
}(events_1.EventEmitter));
exports.QueueHandler = QueueHandler;
// const defaultQueueHandler = new QueueHandler(defaultConfig, [
// 	RABBIT_MQ_CONNECT_STRING
// ]);
exports.default = QueueHandler;
//# sourceMappingURL=index.js.map