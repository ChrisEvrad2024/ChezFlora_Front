// src/interfaces/services/invoice-service.interface.ts
import { InvoiceResponseDto } from '../../application/dtos/invoice/invoice-response.dto';
import { CreateInvoiceDto } from '../../application/dtos/invoice/create-invoice.dto';
import { UpdateInvoiceStatusDto } from '../../application/dtos/invoice/update-invoice-status.dto';

export interface InvoiceServiceInterface {
    getInvoiceById(id: string): Promise<InvoiceResponseDto>;
    getInvoiceByOrderId(orderId: string): Promise<InvoiceResponseDto | null>;
    getAllInvoices(page?: number, limit?: number, status?: string): Promise<{ invoices: InvoiceResponseDto[], total: number, totalPages: number }>;
    createInvoice(invoiceData: CreateInvoiceDto): Promise<InvoiceResponseDto>;
    updateInvoiceStatus(id: string, statusData: UpdateInvoiceStatusDto): Promise<InvoiceResponseDto>;
    generateInvoicePdf(id: string): Promise<string>;
}