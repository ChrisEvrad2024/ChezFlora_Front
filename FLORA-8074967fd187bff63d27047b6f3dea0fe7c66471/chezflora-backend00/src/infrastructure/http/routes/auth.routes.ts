// src/infrastructure/http/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../../../application/services/auth/auth.service';
import { UserRepository } from '../../../infrastructure/repositories/user.repository';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/auth.validator';

const router = Router();

// Assurez-vous que ces schémas existent
console.log('Register schema:', validators.registerSchema);
console.log('Login schema:', validators.loginSchema);

// Initialisation des dépendances
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Routes publiques (vérifiez que les schémas ne sont pas undefined)
router.post('/register', authController.register);
router.post('/login', validateBody(validators.loginSchema), authController.login);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
export default router;