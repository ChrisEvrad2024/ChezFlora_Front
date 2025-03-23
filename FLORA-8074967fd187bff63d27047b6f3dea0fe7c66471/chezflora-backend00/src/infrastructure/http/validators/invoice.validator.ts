// src/infrastructure/http/validators/invoice.validator.ts
import Joi from 'joi';

export const createInvoiceSchema = Joi.object({
    orderId: Joi.string().uuid().required(),
    dueDate: Joi.date().min('now').allow(null),
    taxRate: Joi.number().min(0).max(100).allow(null)
});

export const updateInvoiceStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'paid', 'cancelled').required(),
    paymentDate: Joi.date().max('now').allow(null)
});