'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LiveRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LiveRoom.init({
    liveName: {
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
    liveId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    streamKey:{
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'LiveRoom',
    underscored: true,
    timestamps: true
  });
  return LiveRoom;
};