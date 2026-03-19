import { DataTypes } from 'sequelize';
import sequelize from '../configs/database.js';

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cake_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true
    },
    flavor: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    pickup_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'bookings',
    timestamps: true
});

Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
};

export default Booking;
