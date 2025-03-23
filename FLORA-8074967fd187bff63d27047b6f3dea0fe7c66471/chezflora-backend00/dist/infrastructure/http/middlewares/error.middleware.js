"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
