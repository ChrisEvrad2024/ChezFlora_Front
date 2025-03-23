"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.requestPasswordResetSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
// src/infrastructure/http/validators/auth.validator.ts
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    firstName: joi_1.default.string().required().min(2).max(50),
    lastName: joi_1.default.string().required().min(2).max(50),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required().min(6).max(100),
    phone: joi_1.default.string().allow('', null)
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
exports.updateProfileSchema = joi_1.default.object({
    firstName: joi_1.default.string().min(2).max(50),
    lastName: joi_1.default.string().min(2).max(50),
    email: joi_1.default.string().email(),
    phone: joi_1.default.string().allow('', null)
}).min(1);
exports.requestPasswordResetSchema = joi_1.default.object({
    email: joi_1.default.string().email().required()
});
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required(),
    password: joi_1.default.string().required().min(6).max(100)
});
