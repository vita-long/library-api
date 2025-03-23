const Book = require('./admin/book');
const Author = require('./admin/author');
const BookAuthor = require('./admin/book-author');
const Category = require('./admin/category');
const BookCategory = require('./admin/book-category');
const Comment = require('./admin/comment');

const Login = require('./login');

const auth = require('../middleware/auth');
const csrf = require('../middleware/csrf');

function routers(app) {
  app.use('/books', auth, csrf, Book);
  app.use('/authors', auth, csrf, Author);
  app.use('/bookAuthor', auth, csrf, BookAuthor);
  app.use('/categories', auth, csrf, Category);
  app.use('/bookCategory', auth, csrf, BookCategory);
  app.use('/comment', auth, csrf, Comment);
  app.use('/user', Login);
}

module.exports = {
  routers
}
