// src/application/validations/category.validation.ts
import Joi from 'joi';

export const createCategorySchema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    description: Joi.string().allow('').optional(),
    parentId: Joi.string().uuid().allow(null).optional(),
    image: Joi.string().uri().optional()
});

export const updateCategorySchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    description: Joi.string().allow('').optional(),
    parentId: Joi.string().uuid().allow(null).optional(),
    image: Joi.string().uri().optional()
}).min(1);