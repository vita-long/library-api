const express = require('express');
const router = express.Router();
const { Author } = require('../../models');
const { Op } = require('sequelize');
const { generateId } = require('../../utils/generateId');
const { NotFoundError, success, fail } = require('../../utils/response');

// 查询作者列表-模糊搜索
router.get('/', async function(req, res, next) {
  try {
    const query = req.query;
    const { current, pageSize, offset } = getPagination(query);

    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    }
    if (query.title) {
      condition.where = vague(query)
    }
    const { count, rows } = await Author.findAndCountAll(condition);
    success(res, { list: rows, total: count, current, pageSize })
  } catch (error) {
    fail(res, error)
  }
});

// 查询作者详情
router.get('/:id', async function(req, res, next) {
  try{
    const author = await getAuthor(req);
    success(res, author, '查询成功')
  }catch(error) {
    fail(res, error)
  }
})

// 新增作者
router.post('/', async function(req, res, next) {
  try{
    const body = filterBody(req);
    const author = await Author.create(body);
    if(author) {
      success(res, author, '查询成功')
    } else {
      fail(res, error)
    }

  }catch(error) {
    fail(res, error)
  }
})

// 删除作者
// /authors/{id}
router.delete('/:id', async function(req, res, next) {
  try{
    const author = await getAuthor(req);
    await author.destroy();
    success(res, author)
  }catch(error) {
    fail(res, error)
  }
})

// 更新作者
// /authors/:id
router.put('/:id', async function(req, res, next) {
  try{
    const author = await getAuthor(req);
    const body = filterBody(req);
    await author.update(body);
    success(res, author, '更新作者成功')
  }catch(error) {
    fail(res, error)
  }
})

async function getAuthor(req) {
  const { id } = req.params;

  const author = await Author.findByPk(id);

  if (!author) {
    throw new NotFoundError(`作者未找到`)
  }
  return author;
}

function filterBody(req) {
  return {
    authorCode: generateId('author_'),
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

// 模糊搜索条件
function vague(query) {

  return {
    authorName: {
      [Op.like]: `%${query.authorName}%`
    }
  }
}


module.exports = router;
