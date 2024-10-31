'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserStatusRemark extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserStatusRemark.init({
    userId: DataTypes.INTEGER,
    remark: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'UserStatusRemark',
  });
  return UserStatusRemark;
};