// 发送更新通知给所有客户端
function sendNotification(clients, message) {
  const data = JSON.stringify({
    type: message.type,
    data: message.msg,
    timestamp: new Date().toISOString()
  });

  // 安全遍历方法（使用数组副本）
  clients.slice().forEach(client => {
    try {
      if (!client.res.writableEnded) {
        client.res.write(`event: update\n`);  // 添加事件类型
        client.res.write(`data: ${data}\n\n`);
      } else {
        // 自动清理已关闭的连接
        clients = clients.filter(c => c.id !== client.id);
      }
    } catch (err) {
      console.error(`发送到客户端 ${client.id} 失败:`, err);
      clients = clients.filter(c => c.id !== client.id);
    }
  });
}

module.exports = {
  sendNotification
}