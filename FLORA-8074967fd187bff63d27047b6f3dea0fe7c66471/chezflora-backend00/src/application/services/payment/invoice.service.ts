// src/application/services/payment/invoice.service.ts
import { InvoiceServiceInterface } from '../../../interfaces/services/invoice-service.interface';
import { InvoiceRepositoryInterface } from '../../../interfaces/repositories/invoice-repository.interface';
import { InvoiceResponseDto } from '../../dtos/invoice/invoice-response.dto';
import { CreateInvoiceDto } from '../../dtos/invoice/create-invoice.dto';
import { UpdateInvoiceStatusDto } from '../../dtos/invoice/update-invoice-status.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';

export class InvoiceService implements InvoiceServiceInterface {
    constructor(private invoiceRepository: InvoiceRepositoryInterface) {}

    async getInvoiceById(id: string): Promise<InvoiceResponseDto> {
        const invoice = await this.invoiceRepository.findById(id);
        
        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }
        
        return invoice;
    }

    async getInvoiceByOrderId(orderId: string): Promise<InvoiceResponseDto | null> {
        if (!orderId) {
            throw new AppError('Order ID is required', 400);
        }
        
        return this.invoiceRepository.findByOrderId(orderId);
    }

    async getAllInvoices(page: number = 1, limit: number = 10, status?: string): Promise<{ invoices: InvoiceResponseDto[], total: number, totalPages: number }> {
        const { invoices, total } = await this.invoiceRepository.findAll(page, limit, status);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            invoices,
            total,
            totalPages
        };
    }

    async createInvoice(invoiceData: CreateInvoiceDto): Promise<InvoiceResponseDto> {
        if (!invoiceData.orderId) {
            throw new AppError('Order ID is required', 400);
        }
        
        // Si une date d'échéance est fournie, vérifier qu'elle est dans le futur
        if (invoiceData.dueDate && new Date(invoiceData.dueDate) < new Date()) {
            throw new AppError('Due date must be in the future', 400);
        }
        
        // Si un taux de taxe est fourni, vérifier qu'il est valide
        if (invoiceData.taxRate && (invoiceData.taxRate < 0 || invoiceData.taxRate > 100)) {
            throw new AppError('Tax rate must be between 0 and 100', 400);
        }
        
        return this.invoiceRepository.create(invoiceData);
    }

    async updateInvoiceStatus(id: string, statusData: UpdateInvoiceStatusDto): Promise<InvoiceResponseDto> {
        if (!id) {
            throw new AppError('Invoice ID is required', 400);
        }
        
        if (!statusData.status) {
            throw new AppError('Status is required', 400);
        }
        
        // Vérifier si le statut est valide
        const validStatuses = ['pending', 'paid', 'cancelled'];
        if (!validStatuses.includes(statusData.status)) {
            throw new AppError('Invalid status', 400);
        }
        
        // Si le statut est "paid" et qu'une date de paiement est fournie, vérifier qu'elle n'est pas dans le futur
        if (statusData.status === 'paid' && statusData.paymentDate && new Date(statusData.paymentDate) > new Date()) {
            throw new AppError('Payment date cannot be in the future', 400);
        }
        
        const updatedInvoice = await this.invoiceRepository.updateStatus(id, statusData);
        
        if (!updatedInvoice) {
            throw new AppError('Invoice not found', 404);
        }
        
        return updatedInvoice;
    }

    async generateInvoicePdf(id: string): Promise<string> {
        if (!id) {
            throw new AppError('Invoice ID is required', 400);
        }
        
        // Vérifier si la facture existe
        const invoice = await this.invoiceRepository.findById(id);
        
        if (!invoice) {
            throw new AppError('Invoice not found', 404);
        }
        
        // Si la facture a déjà un fichier PDF et qu'il existe, retourner l'URL
        if (invoice.fileUrl) {
            return invoice.fileUrl;
        }
        
        // Sinon, générer un nouveau PDF
        return this.invoiceRepository.generatePdf(id);
    }
}