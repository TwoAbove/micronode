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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var events_1 = require("events");
var ajv_1 = __importDefault(require("ajv"));
var deserialize_1 = __importDefault(require("./deserialize"));
var serialize_1 = __importDefault(require("./serialize"));
// const createAmqpConfiguration = require('./createAmqpConfiguration');
var ajv = new ajv_1.default({ allErrors: true });
var randomString = function () {
    return Math.random()
        .toString(36)
        .substr(2, 10);
};
var BaseQueue = /** @class */ (function (_super) {
    __extends(BaseQueue, _super);
    function BaseQueue(name, appName, config, globalEmit, getConnection) {
        var _this = _super.call(this) || this;
        _this.channelEstablished = false;
        _this.listening = false;
        _this.connected = false;
        _this.name = name;
        _this.appName = appName;
        _this.key = appName + "." + name;
        _this.config = config;
        _this.getConnection = getConnection;
        _this.globalEmit = globalEmit;
        _this.validateMessageBody = ajv.compile(config.messageBodySchema);
        _this.setupChannel();
        return _this;
    }
    BaseQueue.prototype.setupChannel = function () {
        var _this = this;
        var name = this.name;
        var config = this.config;
        var key = this.key;
        var connection = this.getConnection();
        this.channelWrapper = connection.createChannel({
            // json: true,
            setup: function (channel) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: 
                            // console.log('channel', channel);
                            // `channel` here is a regular amqplib `ConfirmChannel`.
                            // Note that `this` here is the channelWrapper instance.
                            return [4 /*yield*/, channel.assertExchange(config.exchange, 'topic', {
                                    durable: config.durable
                                })];
                            case 1:
                                // console.log('channel', channel);
                                // `channel` here is a regular amqplib `ConfirmChannel`.
                                // Note that `this` here is the channelWrapper instance.
                                _a.sent();
                                return [4 /*yield*/, channel.assertExchange(config.deferredExchange, 'topic', {
                                        durable: config.durable
                                    })];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, channel.assertExchange(config.deadLetterExchange, 'topic', {
                                        durable: config.durable
                                    })];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, channel.assertQueue(name, {
                                        durable: config.durable,
                                        deadLetterExchange: config.deadLetterExchange
                                    })];
                            case 4:
                                _a.sent();
                                return [4 /*yield*/, channel.bindQueue(name, config.exchange, key)];
                            case 5:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            }
        });
        this.channelWrapper.on('error', function (err) {
            _this.complexEmit('error', err);
        });
        this.channelWrapper.on('connect', function () {
            _this.connected = true;
            _this.complexEmit('connect');
            if (_this.shouldStartConsuming) {
                _this.addConsumeSetup();
            }
        });
        this.channelWrapper.on('disconnect', function () {
            _this.connected = false;
            _this.complexEmit('disconnect');
            if (_this.shouldStartConsuming) {
                _this.addConsumeSetup();
            }
        });
        this.channelEstablished = true;
    };
    BaseQueue.prototype.listen = function (worker, concurrency) {
        if (concurrency === void 0) { concurrency = 1; }
        assert_1.default(!this.listening, 'Should only start listening one time');
        this.worker = worker;
        this.concurrency = concurrency;
        this.shouldStartConsuming = true;
        if (this.connected) {
            this.addConsumeSetup();
        }
        // @TODO: check if setup channel should be called
        // regardless of connection status
        this.setupChannel();
        return Promise.resolve();
    };
    BaseQueue.prototype.addConsumeSetup = function () {
        var _this = this;
        this.getChannel().addSetup(function (channel) { return __awaiter(_this, void 0, void 0, function () {
            var consume;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.ack) return [3 /*break*/, 2];
                        return [4 /*yield*/, channel.prefetch(this.concurrency)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, channel.consume(this.name, this.messageHandler.bind(this), {
                            noAck: !this.config.ack
                        })];
                    case 3:
                        consume = _a.sent();
                        this.consumerTag = consume.consumerTag;
                        this.listening = true;
                        return [2 /*return*/];
                }
            });
        }); });
    };
    BaseQueue.prototype.stopListening = function () {
        var _this = this;
        assert_1.default(this.listening === true, 'Tried to cancel listening but it was not started');
        return this.getChannel()
            .addSetup(function (channel) { return channel.cancel(_this.consumerTag); })
            .then(function () {
            _this.listening = false;
            return true;
        });
    };
    BaseQueue.prototype.publish = function (body, properties) {
        if (properties === void 0) { properties = {}; }
        assert_1.default(this.validateMessageBody(body), ajv.errorsText(this.validateMessageBody.errors));
        var _a = serialize_1.default(body), content = _a.content, contentType = _a.contentType;
        var options = {
            persistent: true,
            contentType: contentType,
            messageId: randomString(),
            timestamp: Math.floor(new Date().getTime() / 1000),
            appId: this.appName
        };
        ['priority', 'correlationId', 'messageId', 'type'].forEach(function (property) {
            if (properties[property]) {
                options[property] = properties[property];
            }
        });
        var exchange = this.config.exchange;
        if (properties.defer) {
            if (!this.config.deferredExchange) {
                throw new Error("Can't defer on " + this.name + ": feature not supported by configuration");
            }
            exchange = this.config.deferredExchange;
            options.expiration = properties.defer;
        }
        return this.getChannel().publish(exchange, this.key, content, options);
    };
    BaseQueue.prototype.getChannel = function () {
        if (this.channelEstablished) {
            return this.channelWrapper;
        }
        this.setupChannel();
        return this.channelWrapper;
    };
    BaseQueue.prototype.messageHandler = function (originalMessage) {
        var _this = this;
        if (originalMessage === null) {
            this.complexEmit('error', new Error('Consumer was canceled by broker'));
            return;
        }
        var content = originalMessage.content, fields = originalMessage.fields, properties = originalMessage.properties;
        var body = deserialize_1.default(content, properties.contentType);
        var message = {
            body: body,
            priority: properties.priority,
            correlationId: properties.correlationId,
            messageId: properties.messageId,
            timestamp: typeof properties.timestamp === 'number'
                ? new Date(properties.timestamp * 1000)
                : null,
            type: properties.type,
            appId: properties.appId,
            key: fields.routingKey,
            redelivered: fields.redelivered,
            originalMessage: originalMessage
        };
        if (this.config.ack) {
            message.ack = function () { return _this.getChannel().ack(originalMessage); };
            message.nack = function () { return _this.getChannel().nack(originalMessage); };
        }
        else {
            message.ack = function () {
                throw new Error('Can not ack or nack because queue is created with <ack> = false');
            };
            message.nack = message.ack;
        }
        this.worker(message);
    };
    BaseQueue.prototype.complexEmit = function (eventName) {
        var props = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            props[_i - 1] = arguments[_i];
        }
        this.emit.apply(this, __spreadArrays([eventName], props));
        this.globalEmit.apply(this, __spreadArrays([this.name + ":" + eventName], props));
    };
    return BaseQueue;
}(events_1.EventEmitter));
exports.default = BaseQueue;
//# sourceMappingURL=BaseQueue.js.map