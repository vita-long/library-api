// csrf过期时间
const CSRF_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 24h

const SERVER_URL = 'http://localhost:4000';

module.exports = {
  CSRF_TOKEN_EXPIRATION,
  SERVER_URL
}