"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Vote.belongsTo(models.Election, {
        foreignKey: "electionId",
        as: "election",
      });

      // Vote.belongsTo(models.User, {
      //   foreignKey: "candidateId",
      //   as: "user", // Alias for the associated User model
      // });
    }
  }
  Vote.init(
    {
      electionId: DataTypes.INTEGER,
      voterId: DataTypes.INTEGER,
      candidateId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Vote",
    }
  );
  return Vote;
};
