// src/infrastructure/http/routes/dashboard.routes.ts
import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../../../application/services/report/dashboard.service';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import * as validators from '../validators/dashboard.validator';

const router = Router();

// Initialisation des dépendances
const dashboardService = new DashboardService();
const dashboardController = new DashboardController(dashboardService);

// Toutes les routes nécessitent une authentification et des droits d'administrateur
router.use(authenticate, authorize(['admin']));

// Routes pour le tableau de bord
router.get('/summary', dashboardController.getDashboardSummary);
router.get('/sales', dashboardController.getSalesStatistics);
router.get('/products', dashboardController.getProductStatistics);
router.get('/customers', dashboardController.getCustomerStatistics);
router.post('/reports', validateBody(validators.reportRequestSchema), dashboardController.generateReport);

export default router;