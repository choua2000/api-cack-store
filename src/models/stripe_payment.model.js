import { DataTypes } from 'sequelize';
import sequelize from '../configs/database.js';

const StripePayment = sequelize.define('StripePayment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    stripe_payment_intent_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    stripe_payment_status: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'StripePayments'
});

export default StripePayment;
