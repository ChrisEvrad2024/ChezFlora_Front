// src/infrastructure/http/routes/cart.routes.ts
import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { CartService } from '../../../application/services/order/cart.service';
import { CartRepository } from '../../repositories/cart.repository';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/cart.validator';

const router = Router();

// Initialisation des dépendances
const cartRepository = new CartRepository();
const cartService = new CartService(cartRepository);
const cartController = new CartController(cartService);

// Routes protégées par authentification
router.use(authenticate);

// Routes pour le panier
router.get('/', cartController.getUserCart);
router.post('/items', validateBody(validators.addToCartSchema), cartController.addToCart);
router.put('/items/:id', validateBody(validators.updateCartItemSchema), cartController.updateCartItem);
router.delete('/items/:id', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

export default router;