export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized. Please login first.",
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden. You don't have permission.",
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization error",
            });
        }
    };
};
