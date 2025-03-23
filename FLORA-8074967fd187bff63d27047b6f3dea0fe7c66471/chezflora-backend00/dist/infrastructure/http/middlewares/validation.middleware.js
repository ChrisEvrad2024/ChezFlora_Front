"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const error_middleware_1 = require("./error.middleware");
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new error_middleware_1.AppError(message, 400));
        }
        next();
    };
};
exports.validateBody = validateBody;
