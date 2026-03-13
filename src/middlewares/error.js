/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error for internal tracking
    console.error(`[Error] ${req.method} ${req.url} - ${message}`);
    if (process.env.NODE_ENV !== 'production' && err.stack) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Only include stack trace in non-production environments
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

/**
 * Custom Error Class
 */
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}
