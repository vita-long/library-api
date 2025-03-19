const express = require('express');
const router = express.Router();
const { BooksAuthor } = require('../../models');
const { NotFoundError, success, fail } = require('../../utils/response');

// 查询书籍-作者关联列表-模糊搜索
router.get('/', async function(req, res, next) {
  try {
    const query = req.query;
    const { current, pageSize, offset } = getPagination(query);

    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    }
    const { count, rows } = await BooksAuthor.findAndCountAll(condition);
    success(res, { list: rows, total: count, current, pageSize })
  } catch (error) {
    fail(res, error)
  }
});

// 新增书籍-作者关联
router.post('/', async function(req, res, next) {
  try{
    const body = filterBody(req);
    const booksAuthor = await BooksAuthor.create(body);
    if(booksAuthor) {
      success(res, booksAuthor, '查询成功')
    } else {
      fail(res, error)
    }

  }catch(error) {
    fail(res, error)
  }
})

// 删除书籍-作者关联
// /bookAuthor/{id}
router.delete('/:id', async function(req, res, next) {
  try{
    const booksAuthor = await getBooksAuthor(req);
    await booksAuthor.destroy();
    success(res, booksAuthor)
  }catch(error) {
    fail(res, error)
  }
})

// 更新书籍-作者关联
// /bookAuthor/:id
router.put('/:id', async function(req, res, next) {
  try{
    const booksAuthor = await getBooksAuthor(req);
    const body = filterBody(req);
    await booksAuthor.update(body);
    success(res, booksAuthor, '更新书籍-作者关联成功')
  }catch(error) {
    fail(res, error)
  }
})

async function getBooksAuthor(req) {
  const { id } = req.params;

  const booksAuthor = await BooksAuthor.findByPk(id);

  if (!booksAuthor) {
    throw new NotFoundError(`书籍-作者关联未找到`)
  }
  return booksAuthor;
}

function filterBody(req) {
  return {
    authorCode: req.body.authorCode,
    bookCode: req.body.bookCode
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
