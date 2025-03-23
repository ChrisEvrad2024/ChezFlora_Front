// src/application/services/report/dashboard.service.ts
import { DashboardServiceInterface } from '../../../interfaces/services/dashboard-service.interface';
import { DashboardSummaryDto } from '../../dtos/dashboard/dashboard-summary.dto';
import { SalesStatisticsDto } from '../../dtos/dashboard/sales-statistics.dto';
import { ProductStatisticsDto } from '../../dtos/dashboard/product-statistics.dto';
import { CustomerStatisticsDto } from '../../dtos/dashboard/customer-statistics.dto';
import { ReportRequestDto } from '../../dtos/dashboard/report-request.dto';
import  sequelize  from '../../../infrastructure/config/database';
import Order from '../../../infrastructure/database/models/order.model';
import OrderItem from '../../../infrastructure/database/models/order-item.model';
import User from '../../../infrastructure/database/models/user.model';
import Product from '../../../infrastructure/database/models/product.model';
import Category from '../../../infrastructure/database/models/category.model';
import Quote from '../../../infrastructure/database/models/quote.model';
import { Op } from 'sequelize';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

export class DashboardService implements DashboardServiceInterface {
    async getDashboardSummary(): Promise<DashboardSummaryDto> {
        try {
            // Récupérer le nombre total de ventes
            const totalSalesResult = await Order.sum('total_amount', {
                where: {
                    status: { [Op.ne]: 'cancelled' }
                }
            });
            const totalSales = totalSalesResult || 0;

            // Récupérer le nombre total de commandes
            const totalOrders = await Order.count();

            // Récupérer le nombre total de clients
            const totalCustomers = await User.count({
                where: { role: 'client' }
            });

            // Récupérer le nombre total de produits
            const totalProducts = await Product.count();

            // Récupérer le nombre de commandes en attente
            const pendingOrders = await Order.count({
                where: { status: 'pending' }
            });

            // Récupérer le nombre de devis en attente
            const pendingQuotes = await Quote.count({
                where: { status: ['requested', 'processing'] }
            });

            // Récupérer le nombre de produits avec un stock bas
            const lowStockProducts = await Product.count({
                where: {
                    stock: { [Op.lt]: 10 }, // Exemple de seuil de stock bas
                    isActive: true
                }
            });

            // Récupérer les ventes mensuelles pour les 6 derniers mois
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlySalesData = await Order.findAll({
                attributes: [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'sales']
                ],
                where: {
                    status: { [Op.ne]: 'cancelled' },
                    createdAt: { [Op.gte]: sixMonthsAgo }
                },
                group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
                order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
                raw: true
            });

            const monthlySales = monthlySalesData.map((item: any) => ({
                month: item.month,
                sales: parseFloat(item.sales) || 0
            }));

            // Récupérer les commandes récentes
            const recentOrdersData = await Order.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['firstName', 'lastName']
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit: 5
            });

            const recentOrders = recentOrdersData.map(order => ({
                id: order.id,
                userId: order.userId,
                customerName: `${order.user.firstName} ${order.user.lastName}`,
                status: order.status,
                totalAmount: parseFloat(order.totalAmount.toString()),
                createdAt: order.createdAt
            }));

            return {
                totalSales: parseFloat(totalSales.toString()),
                totalOrders,
                totalCustomers,
                totalProducts,
                pendingOrders,
                pendingQuotes,
                lowStockProducts,
                monthlySales,
                recentOrders
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError(`Failed to get dashboard summary: ${error.message}`, 500);
            }
            throw new AppError(`Failed to get dashboard summary: ${String(error)}`, 500);
        }
    }

    async getSalesStatistics(startDate?: Date, endDate?: Date): Promise<SalesStatisticsDto> {
        try {
            const whereClause: any = {
                status: { [Op.ne]: 'cancelled' }
            };

            if (startDate) {
                whereClause.createdAt = { ...whereClause.createdAt, [Op.gte]: startDate };
            }

            if (endDate) {
                whereClause.createdAt = { ...whereClause.createdAt, [Op.lte]: endDate };
            }

            // Ventes journalières
            const dailySalesData = await Order.findAll({
                attributes: [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m-%d'), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'sales']
                ],
                where: whereClause,
                group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m-%d')],
                order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m-%d'), 'ASC']],
                raw: true
            });

            const dailySales = dailySalesData.map((item: any) => ({
                date: item.date,
                orders: parseInt(item.orders),
                sales: parseFloat(item.sales) || 0
            }));

            // Ventes mensuelles
            const monthlySalesData = await Order.findAll({
                attributes: [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'sales']
                ],
                where: whereClause,
                group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
                order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
                raw: true
            });

            const monthlySales = monthlySalesData.map((item: any) => ({
                month: item.month,
                orders: parseInt(item.orders),
                sales: parseFloat(item.sales) || 0
            }));

            // Ventes annuelles
            const yearlySalesData = await Order.findAll({
                attributes: [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y'), 'year'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'sales']
                ],
                where: whereClause,
                group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y')],
                order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y'), 'ASC']],
                raw: true
            });

            const yearlySales = yearlySalesData.map((item: any) => ({
                year: item.year,
                orders: parseInt(item.orders),
                sales: parseFloat(item.sales) || 0
            }));

            // Ventes par méthode de paiement
            const salesByPaymentMethodData = await Order.findAll({
                attributes: [
                    'payment_method',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'sales']
                ],
                where: whereClause,
                group: ['payment_method'],
                raw: true
            });

            const salesByPaymentMethod = salesByPaymentMethodData.map((item: any) => ({
                paymentMethod: item.payment_method,
                orders: parseInt(item.orders),
                sales: parseFloat(item.sales) || 0
            }));

            // Valeur moyenne des commandes
            const totalSales = await Order.sum('total_amount', {
                where: whereClause
            });

            const totalOrders = await Order.count({
                where: whereClause
            });

            const averageOrderValue = totalOrders > 0 ? parseFloat(totalSales.toString()) / totalOrders : 0;

            return {
                dailySales,
                monthlySales,
                yearlySales,
                salesByPaymentMethod,
                averageOrderValue
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError(`Failed to get dashboard summary: ${error.message}`, 500);
            }
            throw new AppError(`Failed to get dashboard summary: ${String(error)}`, 500);
        }
    }

    async getProductStatistics(): Promise<ProductStatisticsDto> {
        try {
            // Produits les plus vendus
            const topSellingProductsData = await OrderItem.findAll({
                attributes: [
                    'product_id',
                    [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
                    [sequelize.fn('SUM', sequelize.col('total_price')), 'totalSales']
                ],
                include: [
                    {
                        model: Product,
                        attributes: ['name'],
                        required: true
                    },
                    {
                        model: Order,
                        attributes: [],
                        where: {
                            status: { [Op.ne]: 'cancelled' }
                        },
                        required: true
                    }
                ],
                group: ['product_id'],
                order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
                limit: 10,
                raw: true
            });

            const topSellingProducts = topSellingProductsData.map((item: any) => ({
                id: item.product_id,
                name: item['product.name'],
                totalQuantity: parseInt(item.totalQuantity),
                totalSales: parseFloat(item.totalSales) || 0
            }));

            // Ventes par catégorie
            const categorySalesData = await OrderItem.findAll({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('order_items.total_price')), 'sales'],
                    [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('order_items.order_id'))), 'orders']
                ],
                include: [
                    {
                        model: Product,
                        attributes: ['category_id'],
                        required: true,
                        include: [
                            {
                                model: Category,
                                attributes: ['name'],
                                required: true
                            }
                        ]
                    },
                    {
                        model: Order,
                        attributes: [],
                        where: {
                            status: { [Op.ne]: 'cancelled' }
                        },
                        required: true
                    }
                ],
                group: ['product.category_id'],
                raw: true
            });

            const categorySales = categorySalesData.map((item: any) => ({
                categoryId: item['product.category_id'],
                name: item['product.category.name'],
                sales: parseFloat(item.sales) || 0,
                orders: parseInt(item.orders)
            }));

            // Produits avec stock bas
            const lowStockProductsData = await Product.findAll({
                where: {
                    stock: { [Op.lt]: 10 }, // Exemple de seuil de stock bas
                    isActive: true
                },
                order: [['stock', 'ASC']],
                limit: 10,
                raw: true
            });

            const lowStockProducts = lowStockProductsData.map((item: any) => ({
                id: item.id,
                name: item.name,
                stock: item.stock,
                requiredStock: 10 // Seuil de stock requis (à paramétrer)
            }));

            // Produits en rupture de stock
            const outOfStockProductsData = await Product.findAll({
                where: {
                    stock: 0,
                    isActive: true
                },
                raw: true
            });

            const outOfStockProducts = outOfStockProductsData.map((item: any) => ({
                id: item.id,
                name: item.name
            }));

            return {
                topSellingProducts,
                categorySales,
                lowStockProducts,
                outOfStockProducts
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError(`Failed to get dashboard summary: ${error.message}`, 500);
            }
            throw new AppError(`Failed to get dashboard summary: ${String(error)}`, 500);
        }
    }

    async getCustomerStatistics(startDate?: Date, endDate?: Date): Promise<CustomerStatisticsDto> {
        try {
            const whereClause: any = {};
            
            if (startDate) {
                whereClause.createdAt = { ...whereClause.createdAt, [Op.gte]: startDate };
            }
            
            if (endDate) {
                whereClause.createdAt = { ...whereClause.createdAt, [Op.lte]: endDate };
            }

            // Nouveaux clients par période
            const newCustomersData = await User.findAll({
                attributes: [
                    [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'period'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    ...whereClause,
                    role: 'client'
                },
                group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
                order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
                raw: true
            });

            const newCustomers = newCustomersData.map((item: any) => ({
                period: item.period,
                count: parseInt(item.count)
            }));

            // Meilleurs clients
            const topCustomersData = await Order.findAll({
                attributes: [
                    'user_id',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalSpent']
                ],
                include: [
                    {
                        model: User,
                        attributes: ['first_name', 'last_name'],
                        required: true
                    }
                ],
                where: {
                    status: { [Op.ne]: 'cancelled' },
                    ...whereClause
                },
                group: ['user_id'],
                order: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'DESC']],
                limit: 10,
                raw: true
            });

            const topCustomers = topCustomersData.map((item: any) => ({
                userId: item.user_id,
                name: `${item['user.first_name']} ${item['user.last_name']}`,
                orders: parseInt(item.orders),
                totalSpent: parseFloat(item.totalSpent) || 0
            }));

            // Taux de rétention des clients
            // Cette métrique est plus complexe et pourrait nécessiter une logique personnalisée
            // Pour simplifier, nous allons calculer un taux de rétention fictif
            const customerRetention = [
                { period: '2023-01', rate: 75 },
                { period: '2023-02', rate: 78 },
                { period: '2023-03', rate: 80 },
                { period: '2023-04', rate: 82 },
                { period: '2023-05', rate: 79 },
                { period: '2023-06', rate: 81 }
            ];

            return {
                newCustomers,
                topCustomers,
                customerRetention
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError(`Failed to get dashboard summary: ${error.message}`, 500);
            }
            throw new AppError(`Failed to get dashboard summary: ${String(error)}`, 500);
        }
    }

    async generateReport(request: ReportRequestDto): Promise<{ url: string; filename: string }> {
        try {
            const { reportType, startDate, endDate, format = 'pdf' } = request;
            
            // Générer un nom de fichier unique
            const filename = `${reportType}_report_${moment().format('YYYYMMDD_HHmmss')}.${format}`;
            
            // Dans une application réelle, on générerait ici un rapport
            // Pour cet exemple, on va simuler la génération d'un fichier
            
            // Chemin vers le dossier de rapports (à créer)
            const reportsDir = path.join(__dirname, '../../../../public/reports');
            
            // S'assurer que le dossier existe
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }
            
            // Chemin complet du fichier
            const filePath = path.join(reportsDir, filename);
            
            // Simuler l'écriture d'un fichier (dans une application réelle, on utiliserait une bibliothèque comme PDFKit, ExcelJS, etc.)
            fs.writeFileSync(filePath, `This is a simulated ${reportType} report in ${format} format.`);
            
            // URL pour accéder au fichier
            const url = `/reports/${filename}`;
            
            return { url, filename };
        } catch (error) {
            if (error instanceof Error) {
                throw new AppError(`Failed to get dashboard summary: ${error.message}`, 500);
            }
            throw new AppError(`Failed to get dashboard summary: ${String(error)}`, 500);
        }
    }
}