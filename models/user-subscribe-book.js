'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserSubscribeBook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserSubscribeBook.init({
    userCode:{
      type: DataTypes.STRING,
      allowNull: false
    },
    bookCode: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UserSubscribeBook',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['user_code', 'book_code'],
        unique: true
      }
    ]
  });
  return UserSubscribeBook;
};