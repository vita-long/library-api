'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comment.init({
    commentCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Comment',
    underscored: true,
    timestamps: true
  });
  return Comment;
};