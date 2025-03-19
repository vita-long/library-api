'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Author.init({
    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '作者昵称必须存在'
        },
        notEmpty: {
          msg: '作者昵称不能为空'
        },
        len: {
          args: [2, 10],
          msg: '作者昵称长度需要在2~10个字符之间'
        }
      }
    },
    authorCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Author',
    underscored: true,
    timestamps: true
  });
  return Author;
};