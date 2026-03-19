import { Order, OrderItem, Product, User, sequelize } from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../middlewares/error.js';

// CREATE order (with items, in a transaction)
export const createOrder = catchAsync(async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { payment_method, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            await t.rollback();
            return next(new AppError('items[] are required', 400));
        }

        // Verify user exists
        const user = await User.findByPk(req.user.id);
        if (!user) {
            await t.rollback();
            return next(new AppError('User not found', 404));
        }

        // Calculate totals and validate products
        let total_amount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });
            if (!product) {
                await t.rollback();
                return next(new AppError(`Product ID ${item.product_id} not found`, 404));
            }
            if (product.stock_qty < item.quantity) {
                await t.rollback();
                return next(new AppError(`Insufficient stock for "${product.name}". Available: ${product.stock_qty}`, 400));
            }

            const subtotal = parseFloat(product.price) * item.quantity;
            total_amount += subtotal;

            orderItemsData.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price: product.price,
                subtotal
            });

            // Reduce stock
            await product.update(
                { stock_qty: product.stock_qty - item.quantity },
                { transaction: t }
            );
        }

        // Create order
        const order = await Order.create(
            { user_id: req.user.id, total_amount, payment_method, status: 'pending' },
            { transaction: t }
        );

        // Create order items
        const itemsWithOrderId = orderItemsData.map(item => ({
            ...item,
            order_id: order.id
        }));
        await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

        await t.commit();

        // Fetch the full order with items
        const fullOrder = await Order.findByPk(order.id, {
            include: [{
                model: OrderItem, as: 'items',
                include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
            }]
        });

        return res.status(201).json({ success: true, message: 'Order created', order: fullOrder });
    } catch (err) {
        await t.rollback();
        next(err);
    }
});

// GET all orders
export const getAllOrders = catchAsync(async (_req, res, next) => {
    const limit = Math.max(1, Number(_req.query.limit) || 10);
    const offset = Math.max(0, Number(_req.query.offset) || 0);
    const orders = await Order.findAll({
        attributes: { exclude: ['updatedAt'] },
        include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'address', 'role'] },
            {
                model: OrderItem, as: 'items',
                attributes: { exclude: ['updatedAt'] },
                include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    return res.json({ success: true, message: 'All orders', count: orders.length, limit, offset, data: orders });
});

// GET order by ID
export const getOrderById = catchAsync(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id, {
        attributes: { exclude: ['updatedAt'] },
        include: [
            { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'address', 'role'] },
            {
                model: OrderItem, as: 'items',
                attributes: { exclude: ['updatedAt'] },
                include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
            }
        ]
    });
    if (!order) return next(new AppError('Order not found', 404));
    return res.json({ success: true, data: order });
});

// UPDATE order status
export const updateOrderStatus = catchAsync(async (req, res, next) => {
    const order = await Order.findByPk(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));

    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
        return next(new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400));
    }

    await order.update({ status });
    return res.json({ success: true, message: 'Order status updated', order });
});
