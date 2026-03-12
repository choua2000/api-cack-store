import { DataTypes } from 'sequelize';
import sequelize from '../configs/database.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    stock_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('available', 'out_of_stock'),
        allowNull: false,
        defaultValue: 'available'
    }
});

export default Product;
