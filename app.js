const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const cors = require('cors');
const { consumer } = require('./utils/consumer');
const { routers } = require('./routes');
const { csrfProtect } = require('./utils/csrf');

require('dotenv').config();

const app = express();

// 处理跨域
app.options('*', cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['POST', 'PUT', 'GET', 'DELETE']
}));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['POST', 'PUT', 'GET', 'DELETE']
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 会话配置（CSRF 依赖会话）
app.use(session({
  secret: '1111',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// csrf防护
csrfProtect(app);

app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// 消费者监听
consumer();

// 注册路由
routers(app);

module.exports = app;
