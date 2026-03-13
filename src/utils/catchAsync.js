/**
 * Catch Async Errors
 * Wraps an asynchronous function and catches any errors, passing them to the next middleware.
 * @param {Function} fn - The asynchronous function to wrap.
 * @returns {Function} - The wrapped function.
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
