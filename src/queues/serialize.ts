import assert from 'assert';

const serializers = [
	{
		test: (content: any) => content instanceof Buffer,
		serialize: (content: Buffer): Buffer => content,
		contentType: 'application/octet-stream'
	},
	{
		test: (content: any) => typeof content === 'string',
		serialize: (content: ArrayBuffer | SharedArrayBuffer): Buffer => Buffer.from(content),
		contentType: 'text/plain'
	},
	{
		test: (content: any) => typeof content === 'object',
		serialize: (content: any): Buffer => Buffer.from(JSON.stringify(content)),
		contentType: 'application/json'
	}
];

const serialize = (content: any) => {
	const suitableSerializer = serializers.find(s => s.test(content));
	assert(
		suitableSerializer,
		'Could not find a suitable serializer for provided content'
	);
	return {
		content: suitableSerializer!.serialize(content),
		contentType: suitableSerializer!.contentType
	};
};

export default serialize;
