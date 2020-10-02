const deserializers = {
	'text/plain': (content: Buffer) => content.toString(),
	'application/json': (content: Buffer) => JSON.parse(content.toString()),
	'application/octet-stream': (content: Buffer) => content
};

const deserialize = (content: Buffer, contentType: string) => {
	if (deserializers[contentType]) {
		return deserializers[contentType](content);
	}
	return content;
};

export default deserialize;
