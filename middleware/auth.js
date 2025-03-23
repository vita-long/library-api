const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError } = require('../utils/errors');


const { success, fail, NotFoundError } = require('../utils/response');

module.exports = async function(req, res, next) {
  try{
    //判断Token是否存在
    const authHeader = req.headers.Authorization || req.query.token;
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
      throw new UnauthorizedError('当前接口需要认证才能访问。')
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const { userId } = decoded;

    const user = await User.findByPk(userId);
    if(!user) {
      throw new NotFoundError('用户不存在');
    }

    req.userInfo = user;

    next();
  } catch (error){
    fail(res,error);
  }
}