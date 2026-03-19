import { Cart, CartItem, Product } from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../middlewares/error.js';

// Get current user's cart
export const getCart = catchAsync(async (req, res, next) => {
    let cart = await Cart.findOne({
        where: { user_id: req.user.id },
        include: [
            {
                model: CartItem,
                as: 'items',
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'price', 'image_url', 'stock_qty']
                    }
                ]
            }
        ]
    });

    // If no cart exists, create one
    if (!cart) {
        cart = await Cart.create({ user_id: req.user.id });
        cart = await Cart.findByPk(cart.id, { include: ['items'] });
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// Add item to cart
export const addToCart = catchAsync(async (req, res, next) => {

    const { product_id, quantity } = req.body;

    if (!product_id) {
        return next(new AppError('Product ID is required', 400));
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
        return next(new AppError('Quantity must be a positive integer', 400));
    }

    // Check product
    const product = await Product.findByPk(product_id);

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Check stock
    if (qty > product.stock_qty) {
        return next(new AppError('Quantity exceeds available stock', 400));
    }

    // Find or create cart
    let cart = await Cart.findOne({ where: { user_id: req.user.id } });

    if (!cart) {
        cart = await Cart.create({ user_id: req.user.id });
    }

    // Find existing item
    let cartItem = await CartItem.findOne({
        where: { cart_id: cart.id, product_id }
    });

    if (cartItem) {
        cartItem.quantity += qty;
        await cartItem.save();
    } else {
        cartItem = await CartItem.create({
            cart_id: cart.id,
            product_id,
            quantity: qty
        });
    }

    res.status(201).json({
        success: true,
        message: 'Item added to cart',
        data: cartItem
    });

});

// Update cart item quantity
export const updateCartItem = catchAsync(async (req, res, next) => {

    const itemId = Number(req.params.itemId);
    const qty = Number(req.body.qty);

    if (!Number.isInteger(itemId)) {
        return next(new AppError('Invalid cart item id', 400));
    }

    if (!Number.isInteger(qty) || qty < 1) {
        return next(new AppError('Quantity must be a positive integer', 400));
    }

    const cartItem = await CartItem.findOne({
        where: { id: itemId },
        include: [{
            model: Cart,
            as: 'cart',
            attributes: ['user_id']
        }]
    });

    if (!cartItem || cartItem.cart.user_id !== req.user.id) {
        return next(new AppError('Cart item not found', 404));
    }

    cartItem.quantity = qty;
    await cartItem.save();

    res.status(200).json({
        success: true,
        message: 'Cart item updated',
        data: cartItem
    });

});
// Remove item from cart
export const removeFromCart = catchAsync(async (req, res, next) => {

    const itemId = Number(req.params.itemId);

    if (!Number.isInteger(itemId)) {
        return next(new AppError('Invalid cart item id', 400));
    }

    const cartItem = await CartItem.findOne({
        where: { id: itemId },
        include: [{
            model: Cart,
            as: 'cart',
            attributes: ['user_id']
        }]
    });

    if (!cartItem || cartItem.cart.user_id !== req.user.id) {
        return next(new AppError('Cart item not found', 404));
    }

    await cartItem.destroy();

    res.status(200).json({
        success: true,
        message: 'Item removed from cart'
    });

});

// Clear cart
export const clearCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });

    if (cart) {
        await CartItem.destroy({ where: { cart_id: cart.id } });
    }

    res.status(200).json({
        success: true,
        message: 'Cart cleared'
    });
});
