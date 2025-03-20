const Book = require('./admin/book');
const Author = require('./admin/author');
const BookAuthor = require('./admin/book-author');
const Category = require('./admin/category');
const BookCategory = require('./admin/book-category');
const Comment = require('./admin/comment');

const Login = require('./login');

const auth = require('../middleware/auth');

function routers(app) {
  app.use('/books', auth, Book);
  app.use('/authors', auth, Author);
  app.use('/bookAuthor', auth, BookAuthor);
  app.use('/categories', auth, Category);
  app.use('/bookCategory', auth, BookCategory);
  app.use('/comment', auth, Comment);
  app.use('/user', Login);
}

module.exports = {
  routers
}
