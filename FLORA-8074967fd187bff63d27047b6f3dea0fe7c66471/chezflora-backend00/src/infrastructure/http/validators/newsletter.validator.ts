// src/infrastructure/http/validators/newsletter.validator.ts
import Joi from 'joi';

export const subscribeToNewsletterSchema = Joi.object({
    email: Joi.string().email().required()
});

export const unsubscribeFromNewsletterSchema = Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().allow(null, '')
});