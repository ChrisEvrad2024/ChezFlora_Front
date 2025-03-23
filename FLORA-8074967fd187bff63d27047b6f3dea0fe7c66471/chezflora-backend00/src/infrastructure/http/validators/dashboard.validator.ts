// src/infrastructure/http/validators/dashboard.validator.ts
import Joi from 'joi';

export const reportRequestSchema = Joi.object({
    reportType: Joi.string().valid('sales', 'products', 'customers').required(),
    startDate: Joi.date().iso().allow(null, ''),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).allow(null, ''),
    format: Joi.string().valid('pdf', 'csv', 'excel').default('pdf')
});

export const dateRangeSchema = Joi.object({
    startDate: Joi.date().iso().allow(null, ''),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).allow(null, '')
});