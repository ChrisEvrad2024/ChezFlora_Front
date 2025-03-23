// src/interfaces/repositories/invoice-repository.interface.ts
import { InvoiceResponseDto } from '../../application/dtos/invoice/invoice-response.dto';
import { CreateInvoiceDto } from '../../application/dtos/invoice/create-invoice.dto';
import { UpdateInvoiceStatusDto } from '../../application/dtos/invoice/update-invoice-status.dto';

export interface InvoiceRepositoryInterface {
    findById(id: string): Promise<InvoiceResponseDto | null>;
    findByOrderId(orderId: string): Promise<InvoiceResponseDto | null>;
    findAll(page?: number, limit?: number, status?: string): Promise<{ invoices: InvoiceResponseDto[], total: number }>;
    create(invoiceData: CreateInvoiceDto): Promise<InvoiceResponseDto>;
    updateStatus(id: string, statusData: UpdateInvoiceStatusDto): Promise<InvoiceResponseDto | null>;
    generatePdf(id: string): Promise<string>;
}