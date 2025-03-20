'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '用户昵称必须存在'
        },
        notEmpty: {
          msg: '用户昵称不能为空'
        },
        len: {
          args: [2, 10],
          msg: '用户昵称长度需要在2~10个字符之间'
        }
      }
    },
    userCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: '请填写密码'
        },
        notEmpty: {
          msg: '请填写密码'
        },
        set(value) {
          if(value.length >= 8 && value.length <= 24) {
            this.setDataValue('password', bcrypt.hashSync(value, 12))
          } else {
            throw new Error('密码长度需要在8~24位之间')
          }
        }
      }
    },
    email: DataTypes.STRING,
    avator: DataTypes.STRING,
    sex: DataTypes.INTEGER, // 0 1 2
    role: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'User',
    underscored: true,
    timestamps: true
  });
  return User;
};