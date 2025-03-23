// src/application/dtos/invoice/invoice-response.dto.ts
export interface InvoiceResponseDto {
    id: string;
    orderId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    totalAmount: number;
    taxAmount: number;
    status: 'pending' | 'paid' | 'cancelled';
    paymentDate?: Date;
    fileUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}