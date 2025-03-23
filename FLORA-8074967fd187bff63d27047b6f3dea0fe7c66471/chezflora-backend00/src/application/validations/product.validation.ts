// src/application/validations/product.validation.ts
import Joi from 'joi';

export const createProductSchema = Joi.object({
    categoryId: Joi.string().required().uuid(),
    name: Joi.string().required().min(2).max(100),
    description: Joi.string().allow('').optional(),
    price: Joi.number().required().min(0),
    stock: Joi.number().required().min(0).integer(),
    isActive: Joi.boolean().default(true)
});

export const updateProductSchema = Joi.object({
    categoryId: Joi.string().uuid().optional(),
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().allow('').optional(),
    price: Joi.number().min(0).optional(),
    stock: Joi.number().min(0).integer().optional(),
    isActive: Joi.boolean().optional()
}).min(1);

export const updateProductStockSchema = Joi.object({
    quantity: Joi.number().required().integer()
});

export const addProductImageSchema = Joi.object({
    imageUrl: Joi.string().required().uri(),
    order: Joi.number().integer().min(0).optional()
});

export const reorderProductImagesSchema = Joi.object({
    imageOrders: Joi.array().items(
        Joi.object({
            id: Joi.string().required().uuid(),
            order: Joi.number().required().integer().min(0)
        })
    ).required().min(1)
});