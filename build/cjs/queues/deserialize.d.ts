/// <reference types="node" />
declare const deserializers: {
    readonly 'text/plain': (content: Buffer) => string;
    readonly 'application/json': (content: Buffer) => any;
    readonly 'application/octet-stream': (content: Buffer) => Buffer;
};
declare const deserialize: (content: Buffer, contentType: keyof typeof deserializers) => any;
export default deserialize;
