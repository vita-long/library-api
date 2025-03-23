
const { tokens } = require('../utils/csrf');
const { fail } = require('../utils/response');

module.exports = async function(req, res, next) {
  try{
    const serviceSecret = req.session.csrfSecret;
    const token = req.headers['x-xsrf-token'];
    
    // const secret = req.cookies['XSRF-TOKEN'];

    if (!tokens.verify(serviceSecret, token)) {
      return res.status(403).json({ error: 'CSRF Token 无效' });
    }

    next();
  } catch (error){
    fail(res,error);
  }
}