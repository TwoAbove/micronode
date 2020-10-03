"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const serializers = [
    {
        test: (content) => content instanceof Buffer,
        serialize: (content) => content,
        contentType: 'application/octet-stream'
    },
    {
        test: (content) => typeof content === 'string',
        serialize: (content) => Buffer.from(content),
        contentType: 'text/plain'
    },
    {
        test: (content) => typeof content === 'object',
        serialize: (content) => Buffer.from(JSON.stringify(content)),
        contentType: 'application/json'
    }
];
const serialize = (content) => {
    const suitableSerializer = serializers.find(s => s.test(content));
    assert_1.default(suitableSerializer, 'Could not find a suitable serializer for provided content');
    return {
        content: suitableSerializer.serialize(content),
        contentType: suitableSerializer.contentType
    };
};
exports.default = serialize;
//# sourceMappingURL=serialize.js.map