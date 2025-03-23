// src/infrastructure/http/validators/quote.validator.ts
import Joi from 'joi';

export const createQuoteSchema = Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10),
    eventType: Joi.string().allow('', null),
    eventDate: Joi.date().min('now').allow(null),
    budget: Joi.number().positive().allow(null),
    customerComment: Joi.string().allow('', null)
});

export const updateQuoteSchema = Joi.object({
    status: Joi.string().valid('processing', 'sent', 'accepted', 'rejected'),
    totalAmount: Joi.number().positive().allow(null),
    adminComment: Joi.string().allow('', null),
    validUntil: Joi.date().min('now').allow(null),
    items: Joi.array().items(
        Joi.object({
            productId: Joi.string().uuid().allow(null),
            description: Joi.string().required(),
            quantity: Joi.number().integer().positive().required(),
            unitPrice: Joi.number().positive().required()
        })
    )
});

export const quoteItemSchema = Joi.object({
    productId: Joi.string().uuid().allow(null),
    description: Joi.string().required(),
    quantity: Joi.number().integer().positive().required(),
    unitPrice: Joi.number().positive().required()
});

export const respondToQuoteSchema = Joi.object({
    action: Joi.string().valid('accept', 'reject').required(),
    customerComment: Joi.string().allow('', null)
});