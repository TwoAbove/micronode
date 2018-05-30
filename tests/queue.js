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
  Object.values(queueHandler.queues).forEach(queue => {
    queue.simulateMessage = function (data) {
      this.emit('message', data);
    }
  });
  return queueHandler;
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
      queue.on('message', message => { m = message; });
      queue.simulateMessage({ hello: true });
      expect(m).to.be.an('object').and.have.all.keys('hello');

    });
    it('Should have ack and nack when configured', () => {
      const queueHandler = createQueueStub();
      const queue = createQueueStub().queues.queueOne;
      let m;
      queue.on('message', message => { m = message; });
      queue.simulateMessage({ hello: true });
      expect(typeof m.ack).to.equal('function');
      expect(typeof m.nack).to.equal('function');
    });
    it('Should throw if ack or nack is called when not configured');
    it('Should emit "message" when a message is found');
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
