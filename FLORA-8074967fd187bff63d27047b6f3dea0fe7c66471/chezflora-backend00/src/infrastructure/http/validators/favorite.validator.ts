// src/infrastructure/http/validators/favorite.validator.ts
import Joi from 'joi';

export const addToFavoritesSchema = Joi.object({
    productId: Joi.string().uuid().required()
});