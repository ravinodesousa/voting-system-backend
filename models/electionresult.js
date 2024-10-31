"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ElectionResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association to the User model (representing candidates)
      // ElectionResult.belongsTo(models.User, {
      //   foreignKey: "candidateId",
      //   as: "candidate", // Alias to use when querying
      // });

      // Define association to the Election model
      ElectionResult.belongsTo(models.Election, {
        foreignKey: "electionId",
        as: "election", // Alias to use when querying
      });
    }
  }
  ElectionResult.init(
    {
      electionId: DataTypes.INTEGER,
      candidateId: DataTypes.INTEGER,
      totalVotes: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ElectionResult",
    }
  );
  return ElectionResult;
};
