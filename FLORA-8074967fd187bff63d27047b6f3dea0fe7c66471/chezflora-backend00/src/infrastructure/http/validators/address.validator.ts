// src/infrastructure/http/validators/address.validator.ts
import Joi from 'joi';

export const createAddressSchema = Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    street: Joi.string().required().min(3).max(100),
    zipCode: Joi.string().required().min(2).max(20),
    city: Joi.string().required().min(2).max(50),
    country: Joi.string().required().min(2).max(50),
    phone: Joi.string().allow('', null),
    isDefault: Joi.boolean()
});

export const updateAddressSchema = Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    street: Joi.string().min(3).max(100),
    zipCode: Joi.string().min(2).max(20),
    city: Joi.string().min(2).max(50),
    country: Joi.string().min(2).max(50),
    phone: Joi.string().allow('', null),
    isDefault: Joi.boolean()
}).min(1);