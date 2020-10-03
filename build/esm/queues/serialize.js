import assert from 'assert';
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
    assert(suitableSerializer, 'Could not find a suitable serializer for provided content');
    return {
        content: suitableSerializer.serialize(content),
        contentType: suitableSerializer.contentType
    };
};
export default serialize;
//# sourceMappingURL=serialize.js.map