import sequelize from '../configs/database.js';
import User from './user.model.js';
import Category from './category.model.js';
import Product from './product.model.js';
import Order from './order.model.js';
import OrderItem from './order_item.model.js';

// ─── Associations ──────────────────────────────────────────

// Category → Products (One-to-Many)
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// User → Orders (One-to-Many)
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Order → OrderItems (One-to-Many)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Product → OrderItems (One-to-Many)
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

export { sequelize, User, Category, Product, Order, OrderItem };
