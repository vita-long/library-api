/**
 * 生成组合ID
 * @param {string} prefix - 前缀（可选，如用户类型）
 * @returns {string} - 生成的组合ID
 */
function generateId(prefix = '') {
  // 1. 获取当前时间戳（毫秒）
  const timestamp = Date.now().toString();

  // 2. 生成随机数（4位）
  const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0'); // 补零到4位

  // 3. 组合生成ID
  const combinedID = `${prefix}${timestamp}${randomNum}`;

  return combinedID;
}

module.exports = {
  generateId
}