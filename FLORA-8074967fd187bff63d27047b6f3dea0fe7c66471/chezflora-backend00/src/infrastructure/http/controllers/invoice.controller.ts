// src/infrastructure/http/controllers/invoice.controller.ts
import { Request, Response, NextFunction } from 'express';
import { InvoiceServiceInterface } from '../../../interfaces/services/invoice-service.interface';
import { CreateInvoiceDto } from '../../../application/dtos/invoice/create-invoice.dto';
import { UpdateInvoiceStatusDto } from '../../../application/dtos/invoice/update-invoice-status.dto';
import { AppError } from '../middlewares/error.middleware';

export class InvoiceController {
    constructor(private invoiceService: InvoiceServiceInterface) {}

    getInvoiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const invoiceId = req.params.id;

            const invoice = await this.invoiceService.getInvoiceById(invoiceId);

            res.status(200).json({
                success: true,
                message: 'Invoice retrieved successfully',
                data: invoice
            });
        } catch (error) {
            next(error);
        }
    };

    getInvoiceByOrderId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const orderId = req.params.orderId;

            const invoice = await this.invoiceService.getInvoiceByOrderId(orderId);

            if (!invoice) {
                res.status(404).json({
                    success: false,
                    message: 'No invoice found for this order'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Invoice retrieved successfully',
                data: invoice
            });
        } catch (error) {
            next(error);
        }
    };

    getAllInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string;

            const { invoices, total, totalPages } = await this.invoiceService.getAllInvoices(page, limit, status);

            res.status(200).json({
                success: true,
                message: 'Invoices retrieved successfully',
                data: invoices,
                pagination: {
                    current: page,
                    limit,
                    total,
                    totalPages
                }
            });
        } catch (error) {
            next(error);
        }
    };

    createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const invoiceData: CreateInvoiceDto = req.body;
            const invoice = await this.invoiceService.createInvoice(invoiceData);

            res.status(201).json({
                success: true,
                message: 'Invoice created successfully',
                data: invoice
            });
        } catch (error) {
            next(error);
        }
    };

    updateInvoiceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Vérifier si l'utilisateur est admin
            if (req.user?.role !== 'admin') {
                throw new AppError('Admin access required', 403);
            }

            const invoiceId = req.params.id;
            const statusData: UpdateInvoiceStatusDto = req.body;
            const invoice = await this.invoiceService.updateInvoiceStatus(invoiceId, statusData);

            res.status(200).json({
                success: true,
                message: 'Invoice status updated successfully',
                data: invoice
            });
        } catch (error) {
            next(error);
        }
    };

    generateInvoicePdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const invoiceId = req.params.id;
            
            // Admin ou propriétaire de la commande peut accéder à la facture
            // Cette vérification serait plus robuste dans une application réelle

            const fileUrl = await this.invoiceService.generateInvoicePdf(invoiceId);

            res.status(200).json({
                success: true,
                message: 'Invoice PDF generated successfully',
                data: { fileUrl }
            });
        } catch (error) {
            next(error);
        }
    };
}