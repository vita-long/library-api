
const { tokens } = require('../utils/csrf');
const { fail } = require('../utils/response');
const { CSRF_TOKEN_EXPIRATION, CSRF_TOKEN_KEY } = require('../constants/csrf');
const { getKey, delKey } = require('../utils/redis');

module.exports = async function(req, res, next) {
  try{
    const csrfData = await getKey(CSRF_TOKEN_KEY);
    const clientToken = req.headers['x-xsrf-token'];


    // 验证三步
    const validationResult = async() => {
      // 1. 检查凭证是否存在
      if (!csrfData) return false;
      
      // 2. 检查是否过期
      if (Date.now() - csrfData.timestamp > CSRF_TOKEN_EXPIRATION) {
        await delKey(CSRF_TOKEN_KEY)
        return false;
      }
      
      // 3. 验证 Token 有效性
      return tokens.verify(csrfData.secret, clientToken);
    };

    if (validationResult()) {
      next();
    } else {
      res.status(419).json({ 
        code: 'CSRF_TOKEN_EXPIRED',
        message: 'CSRF Token 已过期，请刷新页面后重试'
      });
    }
  } catch (error){
    fail(res,error);
  }
}