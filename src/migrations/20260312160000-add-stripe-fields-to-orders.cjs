'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Orders', 'stripe_payment_intent_id', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('Orders', 'stripe_payment_status', {
            type: Sequelize.STRING,
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Orders', 'stripe_payment_intent_id');
        await queryInterface.removeColumn('Orders', 'stripe_payment_status');
    }
};
