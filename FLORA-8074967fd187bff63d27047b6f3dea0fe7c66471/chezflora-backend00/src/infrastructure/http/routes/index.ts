// src/infrastructure/http/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import addressRoutes from './address.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import quoteRoutes from './quote.routes';
import favoriteRoutes from './favorite.routes';
import newsletterRoutes from './newsletter.routes';
import dashboardRoutes from './dashboard.routes';
import invoiceRoutes from './invoice.routes';

const router = Router();

// Routes de l'API
router.use('/auth', authRoutes);
router.use('/addresses', addressRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/quotes', quoteRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/invoices', invoiceRoutes);

export default router;