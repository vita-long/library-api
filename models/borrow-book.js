'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BorrowBook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BorrowBook.init({
    userCode:{
      type: DataTypes.STRING,
      allowNull: false
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    returned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'BorrowBook',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['user_code', 'book_id'],
        unique: true
      }
    ]
  });
  return BorrowBook;
};