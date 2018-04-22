const { Queue } = require('../lib');

const queueConfig = {
  connectionUrls: ['url'],
  queueConfig: {},
}

describe('Queue', () => {
  it('Should not throw on create', () => {
    const queue = new Queue(queueConfig);
  });
  it('Should have queues property that contains all configured queues');
  describe('.queues.someQueue', () => {
    it('Should have ack and nack when configured');
    it('Should throw if ack or nack is called when not configured');
    it('Should call worker() when a message is found');
    describe('worker()', () => {
      it('Should be called when a message is recieved from queue');
      it('Should contain message');
    });
    describe('ack()', () => {
      it('Shuold call underlying ack');
    });
    describe('nack()', () => {
      it('Shuold call underlying nack');
    });
  });
});
