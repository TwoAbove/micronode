const { EventEmitter } = require('events');

const createAmqpConfiguration = require('./createAmqpConfiguration');

class Queue extends EventEmitter {
  constructor({ config, defaultQueueConfig, getConnection }) {
    super();

    this.name = config.name;
    this.config = config;
    this.getConnection = getConnection;

    this.ack = config.ack;
    this.durable = config.durable;
    this.hasListeners = false;
    this.once('hasListeners', () => {
      this.startConsuming();
    });
    this.on('newListener', (eventName, listener) => {
      if (!this.hasListeners) this.emit('hasListeners');
    });
    this.setUpChennel();
  }
  setUpChennel() {
    const connection = this.getConnection();
    this.wrapper = connection.createChannel({
      setup: async channel => createAmqpConfiguration(channel, this.config),
    });
  }
  start() {

  }
}

module.exports = (options) => {
  return new Queue(options);
};
