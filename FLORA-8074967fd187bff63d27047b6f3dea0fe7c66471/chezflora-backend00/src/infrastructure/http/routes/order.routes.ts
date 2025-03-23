// src/infrastructure/http/routes/order.routes.ts
import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { OrderService } from '../../../application/services/order/order.service';
import { OrderRepository } from '../../repositories/order.repository';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/order.validator';

const router = Router();

// Initialisation des dépendances
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

// Routes protégées par authentification
router.use(authenticate);

// Routes pour les utilisateurs standard
router.get('/me', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', validateBody(validators.createOrderSchema), orderController.createOrder);
router.post('/:id/cancel', orderController.cancelOrder);

// Routes réservées aux administrateurs
router.get('/', authorize(['admin']), orderController.getAllOrders);
router.patch('/:id/status', authorize(['admin']), validateBody(validators.updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;