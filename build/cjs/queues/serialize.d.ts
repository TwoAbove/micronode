/// <reference types="node" />
declare const serialize: (content: any) => {
    content: Buffer;
    contentType: string;
};
export default serialize;
