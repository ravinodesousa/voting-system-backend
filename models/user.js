"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // User.hasMany(models.ElectionResult, {
      //   foreignKey: "candidateId",
      //   as: "candidate",
      // });
    }
  }
  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      mob_no: DataTypes.STRING,
      photo: DataTypes.STRING,
      gender: DataTypes.ENUM("MALE", "FEMALE"),
      age: DataTypes.INTEGER,
      password: DataTypes.STRING,
      user_type: DataTypes.ENUM("VOTER", "CANDIDATE"),
      partyId: DataTypes.INTEGER,
      status: DataTypes.ENUM("PENDING", "ACCEPTED", "REJECTED", "BLOCKED"),
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
