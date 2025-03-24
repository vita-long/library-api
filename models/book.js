'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Book.init({
    bookName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '名称必须存在'
        },
        notEmpty: {
          msg: '名称不能为空'
        },
        len: {
          args: [2, 30],
          msg: '名称长度需要在2~30个字符之间'
        }
      }
    },
    bookCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING,
    },
    // 封面链接
    cover: {
      type: DataTypes.STRING
    },
    content: DataTypes.TEXT,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Book',
    // paranoid: true,
    underscored: true,
    timestamps: true
  });
  return Book;
};