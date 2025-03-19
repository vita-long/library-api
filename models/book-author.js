'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BooksAuthor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BooksAuthor.init({
    bookCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authorCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'BooksAuthor',
    underscored: true,
    timestamps: true
  });
  return BooksAuthor;
};