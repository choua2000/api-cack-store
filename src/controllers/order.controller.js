import { Order, OrderItem, Product, User, sequelize } from '../models/index.js';

// CREATE order (with items, in a transaction)
export const createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { user_id, payment_method, items } = req.body;

        if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'user_id and items[] are required' });
        }

        // Verify user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate totals and validate products
        let total_amount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction: t });
            if (!product) {
                await t.rollback();
                return res.status(404).json({ error: `Product ID ${item.product_id} not found` });
            }
            if (product.stock_qty < item.quantity) {
                await t.rollback();
                return res.status(400).json({ error: `Insufficient stock for "${product.name}". Available: ${product.stock_qty}` });
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
            { user_id, total_amount, payment_method, status: 'pending' },
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

        return res.status(201).json({ message: 'Order created', order: fullOrder });
    } catch (err) {
        await t.rollback();
        return res.status(500).json({ error: err.message });
    }
};

// GET all orders
export const getAllOrders = async (_req, res) => {
    try {
        const orders = await Order.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                {
                    model: OrderItem, as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return res.json({ message: 'All orders', orders });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// GET order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                {
                    model: OrderItem, as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
                }
            ]
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        return res.json(order);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// UPDATE order status
export const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const { status } = req.body;
        const validStatuses = ['pending', 'paid', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
        }

        await order.update({ status });
        return res.json({ message: 'Order status updated', order });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
