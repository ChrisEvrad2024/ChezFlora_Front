// src/infrastructure/http/validators/order.validator.ts
import Joi from 'joi';

export const createOrderSchema = Joi.object({
    shippingAddressId: Joi.string().uuid().required(),
    paymentMethod: Joi.string().valid('credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery').required()
});

export const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required(),
    trackingNumber: Joi.when('status', {
        is: 'shipped',
        then: Joi.string().required(),
        otherwise: Joi.string().allow(null, '')
    })
});