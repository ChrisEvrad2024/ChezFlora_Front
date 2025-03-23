// src/infrastructure/http/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize';
export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorHandler = (
    error: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', error);

    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
};