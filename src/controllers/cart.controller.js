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
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) return next(new AppError('Product ID is required', 400));

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) return next(new AppError('Product not found', 404));

    // Ensure cart exists for user
    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
        cart = await Cart.create({ user_id: req.user.id });
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
        where: { cart_id: cart.id, product_id }
    });

    if (cartItem) {
        // Increment quantity
        cartItem.quantity += parseInt(quantity);
        await cartItem.save();
    } else {
        // Create new cart item
        cartItem = await CartItem.create({
            cart_id: cart.id,
            product_id,
            quantity: parseInt(quantity)
        });
    }

    res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: cartItem
    });
});

// Update cart item quantity
export const updateCartItem = catchAsync(async (req, res, next) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return next(new AppError('Quantity must be at least 1', 400));
    }

    const cartItem = await CartItem.findByPk(itemId, {
        include: [{ model: Cart, as: 'cart' }]
    });

    if (!cartItem || cartItem.cart.user_id !== req.user.id) {
        return next(new AppError('Cart item not found', 404));
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    res.status(200).json({
        success: true,
        message: 'Cart item updated',
        data: cartItem
    });
});

// Remove item from cart
export const removeFromCart = catchAsync(async (req, res, next) => {
    const { itemId } = req.params;

    const cartItem = await CartItem.findByPk(itemId, {
        include: [{ model: Cart, as: 'cart' }]
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
