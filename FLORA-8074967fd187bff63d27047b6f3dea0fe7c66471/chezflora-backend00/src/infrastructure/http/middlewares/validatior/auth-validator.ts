// src/infrastructure/http/validators/auth.validator.ts
import Joi from 'joi';

export const registerSchema = Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6).max(100),
    phone: Joi.string().allow('', null)
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});


export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    phone: Joi.string().allow('', null)
}).min(1);

export const requestPasswordResetSchema = Joi.object({
    email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().required().min(6).max(100)
});