"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.ProductPromotion = exports.Promotion = exports.Comment = exports.Blog = exports.ServiceImage = exports.Service = exports.QuoteItem = exports.Quote = exports.OrderItem = exports.Order = exports.CartItem = exports.Cart = exports.ProductImage = exports.Product = exports.Category = exports.Address = exports.User = void 0;
exports.initializeDatabase = initializeDatabase;
// src/infrastructure/database/models/index.ts
const User_1 = require("./User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Address_1 = require("./Address");
Object.defineProperty(exports, "Address", { enumerable: true, get: function () { return Address_1.Address; } });
const Category_1 = require("./Category");
Object.defineProperty(exports, "Category", { enumerable: true, get: function () { return Category_1.Category; } });
const Product_1 = require("./Product");
Object.defineProperty(exports, "Product", { enumerable: true, get: function () { return Product_1.Product; } });
const ProductImage_1 = require("./ProductImage");
Object.defineProperty(exports, "ProductImage", { enumerable: true, get: function () { return ProductImage_1.ProductImage; } });
const Cart_1 = require("./Cart");
Object.defineProperty(exports, "Cart", { enumerable: true, get: function () { return Cart_1.Cart; } });
const CartItem_1 = require("./CartItem");
Object.defineProperty(exports, "CartItem", { enumerable: true, get: function () { return CartItem_1.CartItem; } });
const Order_1 = require("./Order");
Object.defineProperty(exports, "Order", { enumerable: true, get: function () { return Order_1.Order; } });
const OrderItem_1 = require("./OrderItem");
Object.defineProperty(exports, "OrderItem", { enumerable: true, get: function () { return OrderItem_1.OrderItem; } });
const Quote_1 = require("./Quote");
Object.defineProperty(exports, "Quote", { enumerable: true, get: function () { return Quote_1.Quote; } });
const QuoteItem_1 = require("./QuoteItem");
Object.defineProperty(exports, "QuoteItem", { enumerable: true, get: function () { return QuoteItem_1.QuoteItem; } });
const Service_1 = require("./Service");
Object.defineProperty(exports, "Service", { enumerable: true, get: function () { return Service_1.Service; } });
const ServiceImage_1 = require("./ServiceImage");
Object.defineProperty(exports, "ServiceImage", { enumerable: true, get: function () { return ServiceImage_1.ServiceImage; } });
const Blog_1 = require("./Blog");
Object.defineProperty(exports, "Blog", { enumerable: true, get: function () { return Blog_1.Blog; } });
const Comment_1 = require("./Comment");
Object.defineProperty(exports, "Comment", { enumerable: true, get: function () { return Comment_1.Comment; } });
const Promotion_1 = require("./Promotion");
Object.defineProperty(exports, "Promotion", { enumerable: true, get: function () { return Promotion_1.Promotion; } });
const ProductPromotion_1 = require("./ProductPromotion");
Object.defineProperty(exports, "ProductPromotion", { enumerable: true, get: function () { return ProductPromotion_1.ProductPromotion; } });
// src/infrastructure/database/config.ts
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
const models = __importStar(require("./models"));
dotenv_1.default.config();
const modelsArray = Object.values(models);
exports.sequelize = new sequelize_typescript_1.Sequelize({
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
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.sequelize.authenticate();
            console.log('Database connection has been established successfully.');
            // In development, you might want to sync the database
            if (process.env.NODE_ENV === 'development') {
                const shouldForce = process.env.DB_FORCE_SYNC === 'true';
                yield exports.sequelize.sync({ force: shouldForce });
                console.log(`Database ${shouldForce ? 'force ' : ''}synchronized.`);
            }
        }
        catch (error) {
            console.error('Unable to connect to the database:', error);
            throw error;
        }
    });
}
exports.default = exports.sequelize;
