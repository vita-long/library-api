const { NotFoundError } = require('./errors');

/**
 * 
 * @param {*} res 
 * @param {*} data 
 * @param {*} msg 
 * @param {*} code 
 */
function success(res, data, msg, code=200) {
  res.status(code).json({
    code: 0,
    data,
    msg
  })
}

function fail(res, error) {
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(e => e.message)  
    res.status(400).json({
      code: 2,
      msg: '请求参数错误',
      errors
    })
  }
  if (error.name === 'NotFoundError') {
    res.status(400).json({
      code: 3,
      msg: '资源不存在',
      errors: [error.message]
    })
  }

  if(error.name === 'BadRequestError') {
    return res.status(400).json({
      code: 4,
      msg: '请求参数错误',
      errors: [error.message]
    });
  }
  if(error.name=== 'UnauthorizedError') {
    return res.status(401).json({
    status:false,
    msg: '认证失败',
    errors: [error.message]
    });
  }


  if(error.name=== 'JsonWebTokenError') {
    return res.status(401).json({
    status:false,
    msg: '认证失败',
    errors: [error.message]
    });
  }

  if(error.name=== 'TokenExpiredError') {
    return res.status(401).json({
    status:false,
    msg: '认证失败',
    errors: [error.message]
    });
  }
  res.status(500).json({
    code: 5,
    msg: '服务器错误',
    errors: [error.message]
  })
}

module.exports = {
  NotFoundError,
  success,
  fail
}