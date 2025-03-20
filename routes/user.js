const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { Op } = require('sequelize');
const { generateId } = require('../../utils/generateId');
const { NotFoundError, success, fail } = require('../../utils/response');

// 查询用户列表-模糊搜索
router.get('/', async function(req, res, next) {
  try {
    const query = req.query;
    const { current, pageSize, offset } = getPagination(query);

    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    }
    const { count, rows } = await User.findAndCountAll(condition);
    success(res, { list: rows, total: count, current, pageSize })
  } catch (error) {
    fail(res, error)
  }
});

// 查询用户详情
router.get('/:id', async function(req, res, next) {
  try{
    const user = await getUser(req);
    success(res, user, '查询成功')
  }catch(error) {
    fail(res, error)
  }
})

// 新增用户
router.post('/', async function(req, res, next) {
  try{
    const body = filterBody(req);
    const user = await User.create(body);
    if(user) {
      success(res, user, '查询成功')
    } else {
      fail(res, error)
    }

  }catch(error) {
    fail(res, error)
  }
})

// 删除用户
router.delete('/:id', async function(req, res, next) {
  try{
    const user = await getUser(req);
    await user.destroy();
    success(res, user)
  }catch(error) {
    fail(res, error)
  }
})

// 更新用户
router.put('/:id', async function(req, res, next) {
  try{
    const user = await getUser(req);
    const body = filterBody(req);
    await user.update(body);
    success(res, user, '更新用户成功')
  }catch(error) {
    fail(res, error)
  }
})

async function getUser(req) {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError(`用户未找到`)
  }
  return user;
}

function filterBody(req) {
  return {
    authorCode: generateId('user_'),
    authorName: req.body.authorName
  };
}

// 分页信息
function getPagination(query) {
  const current = Math.abs(Number(query.current)) || 1;
  const pageSize = Math.abs(Number(query.pageSize)) || 10;
  const offset = (current - 1) * pageSize;
  return {
    current,
    pageSize,
    offset
  }
}

module.exports = router;
