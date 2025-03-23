// src/application/dtos/invoice/update-invoice-status.dto.ts
export interface UpdateInvoiceStatusDto {
    status: 'pending' | 'paid' | 'cancelled';
    paymentDate?: Date;
}