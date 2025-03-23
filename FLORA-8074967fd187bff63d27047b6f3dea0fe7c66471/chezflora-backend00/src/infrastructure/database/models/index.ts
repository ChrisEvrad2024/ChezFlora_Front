// src/infrastructure/database/models/index.ts
import { User } from './user.model';
import { Address } from './Address';
import { Category } from './Category';
import { Product } from './Product';
import { ProductImage } from './ProductImage';
import { Cart } from './Cart';
import { CartItem } from './CartItem';
import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { Quote } from './Quote';
import { QuoteItem } from './QuoteItem';
import { Service } from './Service';
import { ServiceImage } from './ServiceImage';
import { Blog } from './Blog';
import { Comment } from './Comment';
import { Promotion } from './Promotion';
import { ProductPromotion } from './ProductPromotion';

export {
    User,
    Address,
    Category,
    Product,
    ProductImage,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Quote,
    QuoteItem,
    Service,
    ServiceImage,
    Blog,
    Comment,
    Promotion,
    ProductPromotion
};

// src/infrastructure/database/config.ts
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';
import * as models from './models';

dotenv.config();

const modelsArray = Object.values(models);

export const sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'chezflora',
    dialect: 'mysql',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    models: modelsArray,
    logging: process.env.NODE_ENV !== 'production',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // In development, you might want to sync the database
        if (process.env.NODE_ENV === 'development') {
            const shouldForce = process.env.DB_FORCE_SYNC === 'true';
            await sequelize.sync({ force: shouldForce });
            console.log(`Database ${shouldForce ? 'force ' : ''}synchronized.`);
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
}

export default sequelize;