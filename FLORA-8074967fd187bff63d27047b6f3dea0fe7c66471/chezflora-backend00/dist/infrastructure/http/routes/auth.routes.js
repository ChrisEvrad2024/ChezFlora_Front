"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/infrastructure/http/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_service_1 = require("../../../application/services/auth/auth.service");
const user_repository_1 = require("../../../infrastructure/repositories/user.repository");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const validators = __importStar(require("../validators/auth.validator"));
const router = (0, express_1.Router)();
// Initialisation des dépendances
const userRepository = new user_repository_1.UserRepository();
const authService = new auth_service_1.AuthService(userRepository);
const authController = new auth_controller_1.AuthController(authService);
// Routes publiques
router.post('/register', (0, validation_middleware_1.validateBody)(validators.registerSchema), authController.register);
router.post('/login', (0, validation_middleware_1.validateBody)(validators.loginSchema), authController.login);
router.post('/request-password-reset', (0, validation_middleware_1.validateBody)(validators.requestPasswordResetSchema), authController.requestPasswordReset);
router.post('/reset-password', (0, validation_middleware_1.validateBody)(validators.resetPasswordSchema), authController.resetPassword);
// Routes protégées
router.put('/profile', auth_middleware_1.authenticate, (0, validation_middleware_1.validateBody)(validators.updateProfileSchema), authController.updateProfile);
exports.default = router;
