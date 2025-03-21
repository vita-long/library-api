const express = require('express');
const router = express.Router();
const { Book } = require('../../models');
const { Op } = require('sequelize');
const { generateId } = require('../../utils/generateId');
const { NotFoundError, success, fail } = require('../../utils/response');
const { getKey, setKey } = require('../../utils/redis');
const { sendNotification } = require('../../utils/sse');
const { formatParams } = require('../../utils/formatParams');

// 存储所有连接的客户端
let clients = [];

let CACHE_KEY_PREFIX = 'books';
// 查询书籍列表-模糊搜索
router.get('/', async function(req, res, next) {
  try {
    const query = req.query;
    const { current, pageSize, offset } = getPagination(query);

    const cacheKey = `${CACHE_KEY_PREFIX}_current_pageSize_offset`;

    let books = await getKey(cacheKey);

    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    }
    if (query.bookName) {
      condition.where = vague(query)
    }
    if (!books) {
      books = await Book.findAndCountAll(condition);
      await setKey(cacheKey, books);
    }
    success(res, { list: books.rows, total: books.count, current, pageSize })
  } catch (error) {
    fail(res, error)
  }
});

// 查询书籍详情
// router.get('/:id', async function(req, res, next) {
//   try{
//     const book = await getBook(req);
//     success(res, book, '查询成功')
//   }catch(error) {
//     fail(res, error)
//   }
// })

// 新增书籍
router.post('/', async function(req, res, next) {
  try{
    const body = filterBody(req);
    const book = await Book.create(body);
    if(book) {
      success(res, book, '查询成功')
    } else {
      fail(res, error)
    }

  }catch(error) {
    fail(res, error)
  }
})

// 删除书籍
// /books/{id}
router.delete('/:id', async function(req, res, next) {
  try{
    const book = await getBook(req);
    await book.destroy();
    success(res, book)
  }catch(error) {
    fail(res, error)
  }
})

// 更新书籍
// /books/:id
router.put('/:id', async function(req, res, next) {
  try{
    const book = await getBook(req);
    const body = filterUpdateBody(req);
    await book.update(body);
    success(res, book, '更新书籍成功');
    sendNotification(clients, { type: 'update-book', msg: `${book.bookName}更新啦` });
  }catch(error) {
    fail(res, error)
  }
})

// 更新消息通知
router.get('/updates', async function(req, res, next) {
  // 设置 SSE 头
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write('event: connect\n');  // 添加事件类型
  res.write('data: Connected\n\n');

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };

  // 添加自动清理机制
  const removeClient = () => {
    clients = clients.filter(c => c.id !== clientId);
    console.log(`Client ${clientId} disconnected`);
  };

  req.on('close', removeClient);    // 连接关闭时
  res.on('error', removeClient);    // 发生错误时
  res.on('finish', removeClient);   // 流结束时

  clients.push(newClient);
})

async function getBook(req) {
  const { id } = req.params;

  const book = await Book.findByPk(id);

  if (!book) {
    throw new NotFoundError(`ID: ${id}的书籍未找到`)
  }
  return book;
}

function filterBody(req) {
  return {
    bookCode: generateId('book_'),
    bookName: req.body.bookName,
    author: req.body.author,
    avator: req.body.author,
    category: req.body.category,
    content: req.body.content
  };
}

function filterUpdateBody(req) {
  return formatParams({
    bookName: req.body.bookName,
    author: req.body.author,
    avator: req.body.author,
    category: req.body.category,
    content: req.body.content
  });
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
    bookName: {
      [Op.like]: `%${query.bookName}%`
    }
  }
}


module.exports = router;
