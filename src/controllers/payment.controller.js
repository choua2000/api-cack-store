import stripe from '../configs/stripe.js';
import { Order, StripePayment } from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../middlewares/error.js';

export const createPaymentIntent = catchAsync(async (req, res, next) => {
    const { order_id } = req.body;
    if (!order_id) return next(new AppError("order_id is required", 400));

    const order = await Order.findByPk(order_id);
    if (!order) return next(new AppError("Order not found", 404));

    if (order.status === "paid") {
        return next(new AppError("Order already paid", 400));
    }

    // Check if payment already exists in StripePayment table
    const existingPayment = await StripePayment.findOne({ where: { order_id: order.id } });
    if (existingPayment) {
        return next(new AppError("Payment already initialized", 400));
    }

    const amount = Number(order.total_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
        return next(new AppError("Invalid order amount", 400));
    }

    const paymentIntent = await stripe.paymentIntents.create(
        {
            amount: amount,
            currency: "usd",
            metadata: {
                order_id: order.id.toString(),
            }
        },
        {
            idempotencyKey: `order_${order.id}`
        }
    );

    // Save to StripePayment model
    await StripePayment.create({
        order_id: order.id,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status: paymentIntent.status
    });

    return res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
    });
});


//handle webhook
export const handleWebhook = catchAsync(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return next(new AppError(`Webhook Error: ${err.message}`, 400));
    }

    // Handle the event
    const paymentIntent = event.data.object;
    const order_id = paymentIntent.metadata.order_id;

    if (event.type === 'payment_intent.succeeded') {
        // Update Order status
        await Order.update(
            { status: 'paid' },
            { where: { id: order_id } }
        );
        // Update StripePayment status
        await StripePayment.update(
            { stripe_payment_status: paymentIntent.status },
            { where: { order_id: order_id } }
        );
    } else if (event.type === 'payment_intent.payment_failed') {
        // Sync StripePayment status with error message
        await StripePayment.update(
            { stripe_payment_status: paymentIntent.last_payment_error?.message || 'failed' },
            { where: { order_id: order_id } }
        );
    } else {
        // Sync other statuses
        await StripePayment.update(
            { stripe_payment_status: paymentIntent.status },
            { where: { order_id: order_id } }
        );
    }

    return res.status(200).json({ received: true });
});
