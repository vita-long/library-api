const csrf = require('csrf');
const { CSRF_TOKEN_EXPIRATION } = require('../constants');
const tokens = new csrf();

const csrfProtect = (app) => {
  app.use((req, res, next) => {
    let csrfData = req.session.csrfData;
    const now = Date.now();

    if (!csrfData || now - csrfData.timestamp > CSRF_TOKEN_EXPIRATION) {
      csrfData = {
        secret: tokens.secretSync(),
        timestamp: now
      };
      req.session.csrfData = csrfData;
    }
    const token = tokens.create(csrfData.secret);

    res.header('Access-Control-Allow-Credentials', 'true');

    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // 需要前端读取
      sameSite: 'Lax',
      secure: false,
      maxAge: CSRF_TOKEN_EXPIRATION // 同步过期时间
    });

    next();
  })
}

module.exports = {
  csrfProtect,
  tokens
}