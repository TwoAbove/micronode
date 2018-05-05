const chai = require('chai');

const { Queue } = require('../lib');

const expect = chai.expect;

const queueConfig = {
  connectionUrls: ['url'],
  queueConfig: {
    queues: {
      queueOne: {
        ack: true,
      },
      queueTwo: {
        ack: false,
      },
    },
  },
};

const createQueueStub = (config = queueConfig) => {
  const queueHandler = new Queue(config);
  Object.values(queueHandler).map(queue => {
    queue.simulateMessage = function (data) {
      const message = this.createMessageObj(data);
      this.onMessage(message);
    }
  });
}

describe('Queue', () => {
  it('Should not throw on create', () => {
    const queueHandler = new Queue(queueConfig);
  });
  it('Should have queues property that contains all configured queues', () => {
    const queueHandler = new Queue(queueConfig);
    expect(queueHandler.queues).to.have.all.keys('queueOne', 'queueTwo');
  });
  describe('.queues.someQueue message', () => {
    it('Should recieve messages using the onMessage funciton', () => {
      const queue = createQueueStub().queues.queueOne;
      let m;
      queue.onMessage((message) => { m = message; });
      queue.simulateMessage({ hello: true });
      expect(m).to.be.an('object').and.have.all.keys('hello');

    });
    it('Should have ack and nack when configured', () => {
      const queueHandler = createQueueStub();
      queueHandler.queues.queueOne.simulateMessage({ hello: true });
      queueHandler.queues.queueOne.ack.to.be.an.instanceof('function');
      queueHandler.queues.queueOne.nack.to.be.an.instanceof('function');
    });
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
