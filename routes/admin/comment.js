const express = require('express');
const router = express.Router();
const { Comment } = require('../../models');
const { Op } = require('sequelize');
const { generateId } = require('../../utils/generateId');
const { NotFoundError, success, fail } = require('../../utils/response');

// 查询评论列表-模糊搜索
router.get('/', async function(req, res, next) {
  try {
    const query = req.query;
    const { current, pageSize, offset } = getPagination(query);

    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    }
    const { count, rows } = await Comment.findAndCountAll(condition);
    success(res, { list: rows, total: count, current, pageSize })
  } catch (error) {
    fail(res, error)
  }
});

// 查询评论详情
router.get('/:id', async function(req, res, next) {
  try{
    const comment = await getComment(req);
    success(res, comment, '查询成功')
  }catch(error) {
    fail(res, error)
  }
})

// 新增评论
router.post('/', async function(req, res, next) {
  try{
    const body = filterBody(req);
    const comment = await Comment.create(body);
    if(comment) {
      success(res, comment, '查询成功')
    } else {
      fail(res, error)
    }

  }catch(error) {
    fail(res, error)
  }
})

// 删除评论
router.delete('/:id', async function(req, res, next) {
  try{
    const comment = await getComment(req);
    await comment.destroy();
    success(res, comment)
  }catch(error) {
    fail(res, error)
  }
})

// 更新评论
router.put('/:id', async function(req, res, next) {
  try{
    const comment = await getComment(req);
    const body = filterBody(req);
    await comment.update(body);
    success(res, comment, '更新评论成功')
  }catch(error) {
    fail(res, error)
  }
})

async function getComment(req) {
  const { id } = req.params;

  const comment = await Comment.findByPk(id);

  if (!comment) {
    throw new NotFoundError(`ID: ${id}的评论未找到`)
  }
  return comment;
}

function filterBody(req) {
  return {
    commentCode: generateId('comment_'),
    content: req.body.content
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
