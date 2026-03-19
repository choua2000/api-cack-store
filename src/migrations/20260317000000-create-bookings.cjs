'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('bookings', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            cake_type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            size: {
                type: Sequelize.STRING,
                allowNull: false
            },
            flavor: {
                type: Sequelize.STRING,
                allowNull: false
            },
            message: {
                type: Sequelize.STRING,
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            pickup_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'),
                defaultValue: 'pending',
                allowNull: false
            },
            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            payment_status: {
                type: Sequelize.ENUM('unpaid', 'paid', 'refunded'),
                defaultValue: 'unpaid',
                allowNull: false
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('bookings');
        // Drop ENUM types if needed, but Sequelize handles this differently across dialects.
        // For simplicity in this env, dropTable is usually enough.
    }
};
