// src/infrastructure/http/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
        
        // Pour capturer la trace de la pile d'erreur correctement avec classes ES6
        Error.captureStackTrace(this, this.constructor);
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