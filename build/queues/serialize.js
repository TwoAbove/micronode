"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var serializers = [
    {
        test: function (content) { return content instanceof Buffer; },
        serialize: function (content) { return content; },
        contentType: 'application/octet-stream'
    },
    {
        test: function (content) { return typeof content === 'string'; },
        serialize: function (content) { return Buffer.from(content); },
        contentType: 'text/plain'
    },
    {
        test: function (content) { return typeof content === 'object'; },
        serialize: function (content) { return Buffer.from(JSON.stringify(content)); },
        contentType: 'application/json'
    }
];
var serialize = function (content) {
    var suitableSerializer = serializers.find(function (s) { return s.test(content); });
    assert_1.default(suitableSerializer, 'Could not find a suitable serializer for provided content');
    return {
        content: suitableSerializer.serialize(content),
        contentType: suitableSerializer.contentType
    };
};
exports.default = serialize;
//# sourceMappingURL=serialize.js.map