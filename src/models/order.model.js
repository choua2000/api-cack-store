import { DataTypes } from 'sequelize';
import sequelize from '../configs/database.js';

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'canceled', 'completed'),   
        allowNull: false,
        defaultValue: 'pending'
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true
    },
    order_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

export default Order;
