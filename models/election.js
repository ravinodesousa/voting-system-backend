"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Election.hasMany(models.Vote, {
        foreignKey: "electionId",
        as: "votes",
      });

      Election.hasOne(models.ElectionResult, {
        foreignKey: "electionId",
        as: "results",
      });
    }
  }
  Election.init(
    {
      name: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      status: DataTypes.ENUM("ACTIVE", "INACTIVE", "CLOSED"),
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};
