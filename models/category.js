'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Category.init({
    categoryName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '种类必须存在'
        },
        notEmpty: {
          msg: '种类不能为空'
        },
        len: {
          args: [2, 6],
          msg: '种类长度需要在2~6个字符之间'
        }
      }
    },
    categoryCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Category',
    underscored: true,
    timestamps: true
  });
  return Category;
};