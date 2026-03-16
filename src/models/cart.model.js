import { DataTypes } from 'sequelize';
import sequelize from '../configs/database.js';

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    tableName: 'Carts',
    timestamps: true
});

export default Cart;
