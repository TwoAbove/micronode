"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deserializers = {
    'text/plain': function (content) { return content.toString(); },
    'application/json': function (content) { return JSON.parse(content.toString()); },
    'application/octet-stream': function (content) { return content; }
};
var deserialize = function (content, contentType) {
    if (deserializers[contentType]) {
        return deserializers[contentType](content);
    }
    return content;
};
exports.default = deserialize;
//# sourceMappingURL=deserialize.js.map