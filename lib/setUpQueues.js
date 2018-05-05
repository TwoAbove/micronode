module.exports = queueConfig => {
  const queues = {};
  Object.keys(queueConfig.queues).forEach(queue => {
    queues[queue] = queueConfig.queues[queue];
  });
  return queues;
};
