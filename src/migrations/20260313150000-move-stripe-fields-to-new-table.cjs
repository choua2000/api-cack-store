'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Create StripePayments table
        await queryInterface.createTable('StripePayments', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'Orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            stripe_payment_intent_id: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            stripe_payment_status: {
                type: Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // 2. Remove columns from Orders table
        // Note: In a real production environment, you might want to migrate existing data first.
        await queryInterface.removeColumn('Orders', 'stripe_payment_intent_id');
        await queryInterface.removeColumn('Orders', 'stripe_payment_status');
    },

    async down(queryInterface, Sequelize) {
        // 1. Add columns back to Orders table
        await queryInterface.addColumn('Orders', 'stripe_payment_intent_id', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('Orders', 'stripe_payment_status', {
            type: Sequelize.STRING,
            allowNull: true
        });

        // 2. Drop StripePayments table
        await queryInterface.dropTable('StripePayments');
    }
};
