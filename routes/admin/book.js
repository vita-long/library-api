const express = require('express');
const router = express.Router();
const { sequelize, Book, UserSubscribeBook, BorrowBook } = require('../../models');
const { Op } = require('sequelize');
const { generateId } = require('../../utils/generateId');
const { NotFoundError, success, fail } = require('../../utils/response');
const { getKey, setKey, delKey } = require('../../utils/redis');
const { sendNotification } = require('../../utils/sse');
const { formatParams } = require('../../utils/formatParams');
const { BadRequestError } = require('../../utils/errors');

// 存储所有连接的客户端
let clients = new Map();

let CACHE_KEY_PREFIX = '';
// 查询书籍列表-模糊搜索
router.get('/', async function(req, res, next) {
  try {
    const query = req.query;
    const { current, pageSize, offset } = getPagination(query);

    if (isNaN(current) || isNaN(pageSize)) {
      throw new BadRequestError('current or pageSize 参数错误')
    }

    CACHE_KEY_PREFIX = `book_${current}_${pageSize}`;

    let books = await getKey(CACHE_KEY_PREFIX);

    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset,
      raw: true
    }
    if (query.bookName) {
      condition.where = vague(query)
    }
    if (!books) {
      books = await Book.findAndCountAll(condition);
      // 查询书籍收藏信息
      const bookCodes = await getBookSubscribe(req);
      console.log(bookCodes);

      books = await getFinalBooks(books, bookCodes);
      
      await setKey(CACHE_KEY_PREFIX, books);
    }
    success(res, { list: books.rows, total: books.count, current, pageSize })
  } catch (error) {
    fail(res, error)
  }
});

// 查询单个书籍
router.get('/:id', async function(req, res, next) {
  try{
    const { id } = req.params;
    const book = await getBorrowBook(req, id);
    success(res, book, '查询成功');
  }catch(error) {
    fail(res, error)
  }
})

// 新增书籍
router.post('/', async function(req, res, next) {
  try{
    const body = filterBody(req);
    const book = await Book.create(body);
    await delKey(CACHE_KEY_PREFIX);
    if(book) {
      success(res, book, '查询成功')
    } else {
      fail(res, error)
    }

  }catch(error) {
    fail(res, error)
  }
})

// 借阅书籍
router.post('/borrow', async function(req, res, next) {
  const { userCode } = req.userInfo;
  const { endDate, id } = req.body;
  const book = await BorrowBook.findOne({
    where: {
      userCode, bookId: id
    }
  });
  if (book) {
    success(res, null, '当前书籍已被借阅');
  } else {
    const userBorrowBook = await BorrowBook.create({ userCode, bookId: id, endDate });
    success(res, userBorrowBook, '借阅成功');
  }
})

// 删除书籍
router.delete('/', async function(req, res, next) {
  try{
    // 获取 ID 数组
    const ids = req.query.id 
      ? req.query.id.split(',').map(id => parseInt(id.trim()))
      : req.body.ids;
    console.log(ids);
    const result = await Book.destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    });
    // 处理结果
    if (result === 0) {
      return res.json({ message: 'No records found to delete' });
    }
    await delKey(CACHE_KEY_PREFIX);
    success(res, null, '删除成功');
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
    await delKey(CACHE_KEY_PREFIX);
    // sendNotification(clients, { type: 'update-book', msg: `${book.bookName}更新啦` });
    success(res, book, '更新书籍成功');
  }catch(error) {
    fail(res, error)
  }
})

// SSE 路由
router.get('/sse', async (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);

  const clientId = Date.now().toString();
  const newClient = {
    id: clientId,
    res,
    favorites: new Set()
  };
  clients.set(clientId, newClient);

  req.on('close', () => {
    clients.delete(clientId);
  });
});

// 收藏/取消收藏
router.post('/toggle-favorite/:bookCode', async (req, res) => {
  try{
    const { bookCode } = req.params;
    const { userCode } = req.userInfo;
    const book = await UserSubscribeBook.findOne({
      where: {
        userCode,
        bookCode
      }
    })
    if (book) {
      book.destroy();
      success(res, true);
    } else {
      const userSubscribeBook = await UserSubscribeBook.create({ userCode, bookCode });
      success(res, userSubscribeBook, '收藏成功');
    }
    await delKey(CACHE_KEY_PREFIX);
  }catch(error) {
    fail(res, error)
  }
});

// 通知所有关注该书的客户端
function notifyBookUpdate(book) {
  const eventData = {
    type: 'BOOK_UPDATE',
    data: book
  };

  clients.forEach(client => {
    if (client.favorites.has(book.id)) {
      client.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    }
  });
}

async function getBook(req) {
  const { id } = req.params;

  const book = await Book.findByPk(id);

  if (!book) {
    throw new NotFoundError(`ID: ${id}的书籍未找到`)
  }
  return book;
}

// 查询书籍收藏信息
async function getBookSubscribe(req, allBooks) {
  const { userCode } = req.userInfo;
  const books = await UserSubscribeBook.findAll({
    where: {
      userCode
    }
  })
  return books.map(book => book.bookCode);
}

// 所有书籍信息
async function getFinalBooks(books, bookCodes) {
  return {
    ...books,
    rows: books?.rows?.map(book => ({
      ...book,
      isFavorite: bookCodes?.includes(book.bookCode)
    }))
  }
}

// 查询借阅书籍
async function getBorrowBook(req, id) {
  const book = await Book.findByPk(id, {
    include: [{
      model: BorrowBook,
      as: 'borrowRecords',
      attributes: ['returned', 'end_date'],
      where: {
        user_code: req?.userInfo?.userCode
      }
    }]
  })
  const newBook = book.get({ plain: true });
  const result = {
    ...newBook,
    isBorrow: !newBook.borrowRecords?.[0]?.returned,
    borrowDate: newBook.borrowRecords?.[0]?.end_date,
  }
  delete result.borrowRecords;
  return result;
}

function filterBody(req) {
  return {
    bookCode: generateId('book_'),
    bookName: req.body.bookName,
    author: req.body.author,
    cover: req.body.cover,
    description: req.body.description,
    content: req.body.content
  };
}

function filterUpdateBody(req) {
  return formatParams({
    bookName: req.body.bookName,
    author: req.body.author,
    cover: req.body.cover,
    description: req.body.description,
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
