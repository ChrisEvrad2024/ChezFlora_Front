// src/infrastructure/http/controllers/dashboard.controller.ts
import { Request, Response, NextFunction } from 'express';
import { DashboardServiceInterface } from '../../../interfaces/services/dashboard-service.interface';
import { ReportRequestDto } from '../../../application/dtos/dashboard/report-request.dto';
import { AppError } from '../middlewares/error.middleware';

export class DashboardController {
    constructor(private dashboardService: DashboardServiceInterface) {}

    getDashboardSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const summary = await this.dashboardService.getDashboardSummary();

            res.status(200).json({
                success: true,
                message: 'Dashboard summary retrieved successfully',
                data: summary
            });
        } catch (error) {
            next(error);
        }
    };

    getSalesStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

            const statistics = await this.dashboardService.getSalesStatistics(startDate, endDate);

            res.status(200).json({
                success: true,
                message: 'Sales statistics retrieved successfully',
                data: statistics
            });
        } catch (error) {
            next(error);
        }
    };

    getProductStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const statistics = await this.dashboardService.getProductStatistics();

            res.status(200).json({
                success: true,
                message: 'Product statistics retrieved successfully',
                data: statistics
            });
        } catch (error) {
            next(error);
        }
    };

    getCustomerStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

            const statistics = await this.dashboardService.getCustomerStatistics(startDate, endDate);

            res.status(200).json({
                success: true,
                message: 'Customer statistics retrieved successfully',
                data: statistics
            });
        } catch (error) {
            next(error);
        }
    };

    generateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const reportData: ReportRequestDto = req.body;
            const report = await this.dashboardService.generateReport(reportData);

            res.status(200).json({
                success: true,
                message: 'Report generated successfully',
                data: report
            });
        } catch (error) {
            next(error);
        }
    };
}