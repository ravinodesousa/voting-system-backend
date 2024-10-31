"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      mob_no: {
        type: Sequelize.STRING,
      },
      photo: {
        type: Sequelize.STRING,
      },
      gender: {
        type: Sequelize.ENUM("MALE", "FEMALE"),
      },
      age: {
        type: Sequelize.INTEGER,
      },
      password: {
        type: Sequelize.STRING,
      },
      user_type: {
        type: Sequelize.ENUM("VOTER", "CANDIDATE"),
      },
      partyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "ACCEPTED", "REJECTED", "BLOCKED"),
        defaultValue: "PENDING",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
