const amqp = require('amqplib');

const setUpQueues = require('./setUpQueues');

class Queue {
  constructor({
    connectionUrls,
    queueConfig
  }) {
    if(!connectionUrls) {
      throw new Error('Needs at least one connection url');
    }
    this.connectionUrls = connectionUrls;
    this.queues = setUpQueues(queueConfig);
  }

  async connect() {
    this.connection = await amqp.connect(this.connections);
  }
}

module.exports = Queue;
