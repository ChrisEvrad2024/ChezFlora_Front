// src/infrastructure/config/database.ts
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import path from 'path';
import logger from '../logger';

// Import des modèles
import User from '../database/models/user.model';
import Address from '../database/models/address.model';
import Product from '../database/models/product.model';
import Category from '../database/models/category.model';
import Cart from '../database/models/cart.model';
import CartItem from '../database/models/cart-item.model';
import Order from '../database/models/order.model';
import OrderItem from '../database/models/order-item.model';
import Quote from '../database/models/quote.model';
import QuoteItem from '../database/models/quote-item.model';
import Favorite from '../database/models/favorite.model';
import NewsletterSubscription from '../database/models/newsletter-subscription.model';
import Invoice from '../database/models/invoice.model';

dotenv.config();

// Liste de tous les modèles
const models = [
    User,
    Address,
    Product,
    Category,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Quote,
    QuoteItem,
    Favorite,
    NewsletterSubscription,
    Invoice
];

export const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chezflora',
    logging: (msg) => logger.debug(msg),
    models: models, // Utiliser la liste des modèles importée
    define: {
        timestamps: true,
        underscored: true,
    },
});

export const initDatabase = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.info('Connection to database has been established successfully.');

        // Synchronisation en développement uniquement
        if (process.env.NODE_ENV === 'development') {
            // Désactiver les vérifications de clés étrangères
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            await sequelize.sync({ force: true });
            // Réactiver les vérifications de clés étrangères
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            logger.info('Database synchronized');
        }
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;