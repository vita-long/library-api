const csrf = require('csrf');
const tokens = new csrf();

const csrfProtect = (app) => {
  app.use((req, res, next) => {
    let secret = req.session.csrfSecret;
    if (!secret) {
      secret = tokens.secretSync();
      req.session.csrfSecret = secret;
    }
    const token = tokens.create(secret);
    res.header('Access-Control-Allow-Credentials', 'true');

    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // 需要前端读取
      sameSite: 'Lax',
      secure: false
    });

    next();
  })
}

module.exports = {
  csrfProtect,
  tokens
}