const index = require('./home');
const Book = require('./admin/book');
const Author = require('./admin/author');
const BookAuthor = require('./admin/book-author');
const Category = require('./admin/category');
const BookCategory = require('./admin/book-category');
const Comment = require('./admin/comment');
const Upload = require('./upload');
const Ocr = require('./ocr');
const OcrCar = require('./ocr-car');

const Login = require('./login');

const LiveRoom = require('./live');

const auth = require('../middleware/auth');
const csrf = require('../middleware/csrf');
const upload = require('../middleware/upload');

const PREFIX = '/api';

function routers(app) {
  app.use('/', index);
  app.use('/books', auth, csrf, Book);
  app.use('/authors', auth, csrf, Author);
  app.use('/bookAuthor', auth, csrf, BookAuthor);
  app.use('/categories', auth, csrf, Category);
  app.use('/bookCategory', auth, csrf, BookCategory);
  app.use('/comment', auth, csrf, Comment);
  app.use('/liveRoom', auth, csrf, LiveRoom);
  app.use('/user', Login);

  app.use('/upload', upload, Upload);
  app.use(`${PREFIX}/ocr`, auth, csrf, Ocr);
  app.use(`${PREFIX}/ocr-car`, upload, OcrCar);

}

module.exports = {
  routers
}
