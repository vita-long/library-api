const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { success, fail } = require('../utils/response');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors');
const { generateId } = require('../utils/generateId');
const { mailProducer } = require('../utils/rabbitmq');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 登录
router.post('/login', async function(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username) {
      throw new BadRequestError('请填写用户名');
    }
    if (!password) {
      throw new BadRequestError('请填写密码');
    }

    const condition = {
      where: {
        [Op.or]: [
          { userName: username }
        ]
      }
    }

    const user = await User.findOne(condition);
    if(!user) {
      throw new NotFoundError('用户不存在');
    }

    const isPasswordvalid = bcrypt.compareSync(password,user.password);
    if(!isPasswordvalid) {
      throw new UnauthorizedError('密码不正确，请重新输入')
    }

    const token = jwt.sign({
      userId: user.id
    }, process.env.SECRET, { expiresIn: '1h' })
    
    success(res, { token }, '登录成功')
  } catch (error) {
    fail(res, error)
  }
});

// 用户注册
router.post('/register', async function(req, res, next) {
  try {
    const body = {
      userCode: generateId('user_'),
      userName:req.body.userName,
      password:req.body.password,
      email:req.body.email || '',
      avator: req.body.avator || '',
      sex: req.body.sex || 0,
      role: 1
    }
    const user = await User.create(body);
    delete user.dataValues.password;

    const msg = {
      to: user.email,
      subject: '注册成功通知',
      html: `
        您好，<span>${user.username}</span><br/><br/>
        恭喜您注册成功！<br/><br/>
        请访问...了解更多<br/>
        app
      `
    };

    await mailProducer(msg);
  
    success(res,'创建用户成功。', user, 201);
  } catch(error){
    fail(res,error);
  }
});

module.exports = router;
