const CSRF_TOKEN_KEY = 'csrf_token';

// csrf过期时间
const CSRF_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 24h

module.exports = {
  CSRF_TOKEN_KEY,
  CSRF_TOKEN_EXPIRATION
}