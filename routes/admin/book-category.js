const express = require('express');
const router = express.Router();
const { BooksCategory } = require('../../models');
const { NotFoundError, success, fail } = require('../../utils/response');

// 查询
router.get('/', async function(req, res, next) {
  try {
    const query = req.query;
    const { current, pageSize, offset } = getPagination(query);

    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    }
    const { count, rows } = await BooksCategory.findAndCountAll(condition);
    success(res, { list: rows, total: count, current, pageSize })
  } catch (error) {
    fail(res, error)
  }
});

// 根据书籍code查询分类
router.get('/:id', async function(req, res, next) {
  try{
    const booksCategory = await getBooksCategory(req);
    success(res, booksCategory, '查询成功')
  }catch(error) {
    fail(res, error)
  }
})

// 新增书籍
router.post('/', async function(req, res, next) {
  try{
    const body = filterBody(req);
    const booksCategory = await BooksCategory.create(body);
    if(booksCategory) {
      success(res, booksCategory, '查询成功')
    } else {
      fail(res, error)
    }

  }catch(error) {
    fail(res, error)
  }
})

// 删除
router.delete('/:id', async function(req, res, next) {
  try{
    const booksCategory = await getBooksCategory(req);
    await booksCategory.destroy();
    success(res, booksCategory)
  }catch(error) {
    fail(res, error)
  }
})

// 更新
router.put('/:id', async function(req, res, next) {
  try{
    const booksCategory = await getBooksCategory(req);
    const body = filterBody(req);
    await booksCategory.update(body);
    success(res, booksCategory, '更新成功')
  }catch(error) {
    fail(res, error)
  }
})

async function getBooksCategory(req) {
  const { id } = req.params;

  const booksCategory = await BooksCategory.findByPk(id);

  if (!booksCategory) {
    throw new NotFoundError(`未找到`)
  }
  return booksCategory;
}

function filterBody(req) {
  return {
    bookCode: req.body.bookCode,
    categoryCode: req.body.categoryCode,
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
