// src/application/dtos/invoice/create-invoice.dto.ts
export interface CreateInvoiceDto {
    orderId: string;
    dueDate?: Date;
    taxRate?: number;
}