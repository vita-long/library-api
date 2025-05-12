const { createClient } = require('redis');

let client;

/**
 * 初始化redis客户端
 * @returns 
 */
const clientRedis = async () => {
  if(client) {
    return;
  }
  client = await createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
}


const setKey = async (key, value, ttl = null) => {
  if(!client) {
    await clientRedis();
  }
  value = JSON.stringify(value);
  await client.set(key, value);

  // 设置过期时间
  if(ttl !== null) {
    await client.expire(key, ttl)
  }
}

const getKey = async (key) => {
  if(!client) {
    await clientRedis();
  }
  const value = await client.get(key);
  return value ? JSON.parse(value) : ''
}

const delKey = async (key) => {
  if(!client) {
    await clientRedis();
  }
  await client.del(key);
}

module.exports = {
  clientRedis,
  setKey,
  getKey,
  delKey
}