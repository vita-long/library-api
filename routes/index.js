const Book = require('./admin/book');
const Author = require('./admin/author');
const BookAuthor = require('./admin/book-author');
const Category = require('./admin/category');
const BookCategory = require('./admin/book-category');
const Comment = require('./admin/comment');

function routers(app) {
  app.use('/books', Book);
  app.use('/authors', Author);
  app.use('/bookAuthor', BookAuthor);
  app.use('/categories', Category);
  app.use('/bookCategory', BookCategory);
  app.use('/comment', Comment);
}

module.exports = {
  routers
}
