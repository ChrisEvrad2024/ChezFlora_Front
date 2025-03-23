// src/infrastructure/http/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from './error.middleware';

export const validateBody = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Vérifiez si le schéma existe avant d'appeler validate
        if (!schema) {
            return next(new AppError('Validation schema is not defined', 500));
        }

        const { error } = schema.validate(req.body);

        if (error) {
            const message = error.details.map(detail => detail.message).join(', ');
            return next(new AppError(message, 400));
        }

        next();
    };
};