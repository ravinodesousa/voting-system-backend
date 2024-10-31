"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Party extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // todo: association
      // Party.belongsTo(models.User, {
      //   foreignKey: "partyId",
      //   as: "party",
      // });
    }
  }
  Party.init(
    {
      name: DataTypes.STRING,
      status: DataTypes.ENUM("ACTIVE", "INACTIVE"),
    },
    {
      sequelize,
      modelName: "Party",
    }
  );
  return Party;
};
