const { mailConsumer } = require('./rabbitmq');

async function consumer() {
  await mailConsumer();
  console.log('监听');
}

module.exports = {
  consumer
}