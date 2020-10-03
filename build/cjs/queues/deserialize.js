"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deserializers = {
    'text/plain': (content) => content.toString(),
    'application/json': (content) => JSON.parse(content.toString()),
    'application/octet-stream': (content) => content
};
const deserialize = (content, contentType) => {
    if (deserializers[contentType]) {
        return deserializers[contentType](content);
    }
    return content;
};
exports.default = deserialize;
//# sourceMappingURL=deserialize.js.map