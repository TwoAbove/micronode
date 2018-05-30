const amqp = require('amqp-connection-manager');
const { EventEmitter } = require('events');

const setUpQueues = require('./setUpQueues');

class Queue extends EventEmitter {
  constructor({
    connectionUrls,
    queueConfig
  }) {
    super();
    if (!connectionUrls) {
      throw new Error('Needs at least one connection url');
    }
    this.connectionUrls = connectionUrls;
    this.getConnection();
    this.queues = setUpQueues({ config: queueConfig, getConnection: this.getConnection });
  }

  getConnection() {
    if (this.connection) {
      return this.connection;
    }

    this.connection = amqp.connect(this.connectionUrls);

    this.connection.on('connect', ({ connection, url }) => {
      this.emit('connect', { connection, url });
    });
    this.connection.on('disconnect', ({ err }) => {
      this.emit('disconnect', err);
    });

    return this.connection;
  }

  close() {
    if (this.connection && this.connection.isConnected()) {
      this.connection.close();
    }
  }
}

module.exports = Queue;
