const amqplib = require('amqplib');
const { sendMail } = require('./mail');

let connect;
let channel;

const connectRabbitMQ = async () => {
  if (connect && connect) {
    return ;
  }
  try {
    connect = await amqplib.connect('amqp://admin:123456@localhost');
    channel = await connect.createChannel();
    await channel.assertQueue('mail_queue', { durable: true });

  } catch(error) {
    console.log('RabbitMQ 连接失败', error);
  }
}

const mailProducer = async (msg) => {
  try {
    await connectRabbitMQ();

    channel.sendToQueue('mail_queue', Buffer.from(JSON.stringify(msg)), { presistent: true })
  } catch(error) {
    console.log('邮件生产队列错误：', error);
  }
}


// 邮件队列消费者
const mailConsumer = async () => {
  try {
    await connectRabbitMQ();
    channel.consume('mail_queue',
      async (msg) => {
        const message = JSON.parse(msg.content.toString());
        await sendMail(message.to, message.subject, message.html);
      },{
        noAck:true,
      }
    )
  } catch(error) {
    console.log('邮件队列消费者错误：', error)
  }
}

module.exports = {
  mailProducer,
  mailConsumer
}