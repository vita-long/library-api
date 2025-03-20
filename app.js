const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { consumer } = require('./utils/consumer');
const { routers } = require('./routes');

require('dotenv').config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 消费者监听
consumer();

// 处理跨域
app.use(cors());

// 注册路由
routers(app);

module.exports = app;
