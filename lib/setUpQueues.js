const createQueue = require('./createQueue');

module.exports = ({ config, getConnection }) => {
  const queues = {};
  Object.keys(config.queues).forEach(queue => {
    queues[queue] = createQueue({ config: config.queues[queue], getConnection });
  });
  return queues;
};
