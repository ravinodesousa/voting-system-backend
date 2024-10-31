"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Admins", [
      {
        firstName: "Admin",
        lastName: "Test",
        email: "admin@test.com",
        password:
          "$2b$10$LQ9vX7GHzFhkPZQ6EeE.ZOwPYYjwFBic.dIsigi0cbCdTishYMPb.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Admins", null, {});
  },
};
