'use strict';
 module.exports = {
   up: async (queryInterface, Sequelize) => {
     await queryInterface.createTable('Users', {
       id: {
         allowNull: false,
         autoIncrement: true,
         primaryKey: true,
         type: Sequelize.INTEGER
       },
       lastname: {
         type: Sequelize.STRING
       },
       firstname: {
         type: Sequelize.STRING
       },
       email: {
         type: Sequelize.STRING
       },
       password: {
         type: Sequelize.STRING
       },
       userAdmin: {
         allowNull: false,
         type: Sequelize.BOOLEAN
       },
       createdAt: {
         allowNull: false,
         type: Sequelize.DATE
       },
       updatedAt: {
         allowNull: false,
         type: Sequelize.DATE
       }
     });
   },
   down: async (queryInterface, Sequelize) => {
     await queryInterface.dropTable('Users');
   }
 };