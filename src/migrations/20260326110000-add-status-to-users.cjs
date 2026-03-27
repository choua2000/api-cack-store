'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'status', {
            type: Sequelize.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active',
            after: 'address'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'status');
    }
};
