// src/infrastructure/repositories/invoice.repository.ts
import { InvoiceRepositoryInterface } from '../../interfaces/repositories/invoice-repository.interface';
import { InvoiceResponseDto } from '../../application/dtos/invoice/invoice-response.dto';
import { CreateInvoiceDto } from '../../application/dtos/invoice/create-invoice.dto';
import { UpdateInvoiceStatusDto } from '../../application/dtos/invoice/update-invoice-status.dto';
import Invoice from '../database/models/invoice.model';
import Order from '../database/models/order.model';
import OrderItem from '../database/models/order-item.model';
import User from '../database/models/user.model';
import  sequelize  from '../config/database';
import { AppError } from '../http/middlewares/error.middleware';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { Op } from 'sequelize';

export class InvoiceRepository implements InvoiceRepositoryInterface {
    async findById(id: string): Promise<InvoiceResponseDto | null> {
        const invoice = await Invoice.findByPk(id, {
            include: [
                {
                    model: Order,
                    include: [
                        {
                            model: User,
                            attributes: ['firstName', 'lastName', 'email']
                        },
                        OrderItem
                    ]
                }
            ]
        });

        if (!invoice) {
            return null;
        }

        return this.formatInvoiceResponse(invoice);
    }

    async findByOrderId(orderId: string): Promise<InvoiceResponseDto | null> {
        const invoice = await Invoice.findOne({
            where: { orderId },
            include: [
                {
                    model: Order,
                    include: [
                        {
                            model: User,
                            attributes: ['firstName', 'lastName', 'email']
                        },
                        OrderItem
                    ]
                }
            ]
        });

        if (!invoice) {
            return null;
        }

        return this.formatInvoiceResponse(invoice);
    }

    async findAll(page: number = 1, limit: number = 10, status?: string): Promise<{ invoices: InvoiceResponseDto[], total: number }> {
        const offset = (page - 1) * limit;
        const whereClause: any = {};

        if (status) {
            whereClause.status = status;
        }

        const { rows, count } = await Invoice.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Order,
                    include: [
                        {
                            model: User,
                            attributes: ['firstName', 'lastName', 'email']
                        }
                    ]
                }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const invoices = rows.map(invoice => this.formatInvoiceResponse(invoice));

        return {
            invoices,
            total: count
        };
    }

    async create(invoiceData: CreateInvoiceDto): Promise<InvoiceResponseDto> {
        const transaction = await sequelize.transaction();

        try {
            // Vérifier si la commande existe
            const order = await Order.findByPk(invoiceData.orderId, {
                include: [
                    {
                        model: User,
                        attributes: ['firstName', 'lastName', 'email']
                    },
                    OrderItem
                ],
                transaction
            });

            if (!order) {
                await transaction.rollback();
                throw new AppError('Order not found', 404);
            }

            // Vérifier si une facture existe déjà pour cette commande
            const existingInvoice = await Invoice.findOne({
                where: { orderId: invoiceData.orderId },
                transaction
            });

            if (existingInvoice) {
                await transaction.rollback();
                throw new AppError('An invoice already exists for this order', 400);
            }

            // Générer un numéro de facture unique
            const invoiceNumber = await this.generateInvoiceNumber(transaction);

            // Calculer la date d'échéance (par défaut : 30 jours après la date de facture)
            const dueDate = invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            // Calculer le montant de la taxe (si un taux est fourni)
            const taxRate = invoiceData.taxRate || 0;
            const taxAmount = parseFloat(order.totalAmount.toString()) * (taxRate / 100);

            // Créer la facture
            const invoice = await Invoice.create({
                orderId: invoiceData.orderId,
                invoiceNumber,
                invoiceDate: new Date(),
                dueDate,
                totalAmount: order.totalAmount,
                taxAmount,
                status: 'pending'
            }, { transaction });

            // Générer le PDF de la facture
            const fileUrl = await this.generatePdf(invoice.id, transaction);

            // Mettre à jour l'URL du fichier
            await invoice.update({ fileUrl }, { transaction });

            await transaction.commit();

            // Récupérer la facture complète
            const createdInvoice = await Invoice.findByPk(invoice.id, {
                include: [
                    {
                        model: Order,
                        include: [
                            {
                                model: User,
                                attributes: ['firstName', 'lastName', 'email']
                            },
                            OrderItem
                        ]
                    }
                ]
            });

            return this.formatInvoiceResponse(createdInvoice);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateStatus(id: string, statusData: UpdateInvoiceStatusDto): Promise<InvoiceResponseDto | null> {
        const transaction = await sequelize.transaction();

        try {
            const invoice = await Invoice.findByPk(id, {
                include: [Order],
                transaction
            });

            if (!invoice) {
                await transaction.rollback();
                return null;
            }

            // Mettre à jour le statut et la date de paiement si nécessaire
            const updateData: any = { status: statusData.status };

            if (statusData.status === 'paid' && !statusData.paymentDate) {
                updateData.paymentDate = new Date();
            } else if (statusData.paymentDate) {
                updateData.paymentDate = statusData.paymentDate;
            }

            await invoice.update(updateData, { transaction });

            await transaction.commit();

            // Récupérer la facture mise à jour
            const updatedInvoice = await Invoice.findByPk(id, {
                include: [
                    {
                        model: Order,
                        include: [
                            {
                                model: User,
                                attributes: ['firstName', 'lastName', 'email']
                            },
                            OrderItem
                        ]
                    }
                ]
            });

            return this.formatInvoiceResponse(updatedInvoice);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async generatePdf(id: string, transaction?: any): Promise<string> {
        // Dans une application réelle, on utiliserait une bibliothèque comme PDFKit
        // pour générer un vrai PDF de facture. Ici, on simule juste la génération d'un fichier.

        try {
            const invoice = await Invoice.findByPk(id, {
                include: [
                    {
                        model: Order,
                        include: [
                            {
                                model: User,
                                attributes: ['firstName', 'lastName', 'email']
                            },
                            OrderItem
                        ]
                    }
                ],
                transaction
            });

            if (!invoice) {
                throw new AppError('Invoice not found', 404);
            }

            // Créer le dossier pour les factures s'il n'existe pas
            const invoicesDir = path.join(__dirname, '../../../../public/invoices');
            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir, { recursive: true });
            }

            // Générer un nom de fichier pour la facture
            const filename = `invoice_${invoice.invoiceNumber.replace(/\s+/g, '_')}.pdf`;
            const filePath = path.join(invoicesDir, filename);

            // Simuler la création d'un fichier PDF
            fs.writeFileSync(filePath, `This is a simulated invoice PDF for order ${invoice.orderId}.`);

            // Retourner l'URL relative au fichier
            return `/invoices/${filename}`;
        } catch (error) {
            throw error;
        }
    }

    private async generateInvoiceNumber(transaction?: any): Promise<string> {
        // Format : INV-YYYYMMDD-XXXX (XXXX étant un numéro séquentiel)
        const datePrefix = moment().format('YYYYMMDD');
        
        // Trouver le dernier numéro de facture avec ce préfixe de date
        const lastInvoice = await Invoice.findOne({
            where: {
                invoiceNumber: {
                    [Op.like]: `INV-${datePrefix}-%`
                }
            },
            order: [['invoiceNumber', 'DESC']],
            transaction
        });

        let sequentialNumber = 1;
        
        if (lastInvoice) {
            // Extraire le numéro séquentiel
            const parts = lastInvoice.invoiceNumber.split('-');
            if (parts.length === 3) {
                sequentialNumber = parseInt(parts[2]) + 1;
            }
        }

        // Formatter le numéro séquentiel avec des zéros devant (par exemple, 0001)
        const formattedNumber = String(sequentialNumber).padStart(4, '0');
        
        return `INV-${datePrefix}-${formattedNumber}`;
    }

    private formatInvoiceResponse(invoice: any): InvoiceResponseDto {
        return {
            id: invoice.id,
            orderId: invoice.orderId,
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            totalAmount: parseFloat(invoice.totalAmount.toString()),
            taxAmount: parseFloat(invoice.taxAmount.toString()),
            status: invoice.status,
            paymentDate: invoice.paymentDate,
            fileUrl: invoice.fileUrl,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt
        };
    }
}