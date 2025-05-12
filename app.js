const express = require('express');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const cors = require('cors');
const { consumer } = require('./utils/consumer');
const { routers } = require('./routes');
const { csrfProtect } = require('./utils/csrf');
const { SESSION_EXPIRATION } = require('./constants');

const app = express();

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://book.xianlingling.com', 'https://book.xianlingling.com']
  : ['http://localhost:8011', 'http://127.0.0.1:8011', '*'];

// 处理跨域
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['POST', 'PUT', 'GET', 'DELETE']
}));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['POST', 'PUT', 'GET', 'DELETE']
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  req.io = app.get('io'); // 新增
  next();
})

// session 会话
app.use(session({
  secret: '1111',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: SESSION_EXPIRATION
  }
}));

// csrf防护
csrfProtect(app);

app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// 消费者监听
// consumer();

// 注册路由
routers(app);

module.exports = app;
