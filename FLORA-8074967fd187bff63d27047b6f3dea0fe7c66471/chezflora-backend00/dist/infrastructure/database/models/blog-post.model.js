"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductPromotion = exports.Promotion = exports.Comment = exports.Blog = void 0;
// src/infrastructure/database/models/Blog.ts
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const User_1 = require("./User");
const Comment_1 = require("./Comment");
Object.defineProperty(exports, "Comment", { enumerable: true, get: function () { return Comment_1.Comment; } });
let Blog = class Blog extends sequelize_typescript_1.Model {
};
exports.Blog = Blog;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    }),
    __metadata("design:type", String)
], Blog_1.Blog.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'author_id',
        allowNull: false,
    }),
    __metadata("design:type", String)
], Blog_1.Blog.prototype, "authorId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", typeof (_a = typeof User_1.User !== "undefined" && User_1.User) === "function" ? _a : Object)
], Blog_1.Blog.prototype, "author", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Blog_1.Blog.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Blog_1.Blog.prototype, "content", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'publish_date',
        allowNull: true,
    }),
    __metadata("design:type", Date)
], Blog_1.Blog.prototype, "publishDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Blog_1.Blog.prototype, "category", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('draft', 'pending', 'published', 'rejected', 'archived'),
        defaultValue: 'draft',
    }),
    __metadata("design:type", String)
], Blog_1.Blog.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Blog_1.Blog.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Blog_1.Blog.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Comment_1.Comment),
    __metadata("design:type", Array)
], Blog_1.Blog.prototype, "comments", void 0);
exports.Blog = Blog_1.Blog = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'blogs',
        timestamps: true,
    })
], Blog_1.Blog);
const Blog_1 = require("./Blog");
Object.defineProperty(exports, "Blog", { enumerable: true, get: function () { return Blog_1.Blog; } });
let Comment = class Comment extends sequelize_typescript_1.Model {
};
exports.Comment = Comment;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    }),
    __metadata("design:type", String)
], Comment_1.Comment.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Blog_1.Blog),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'blog_id',
        allowNull: false,
    }),
    __metadata("design:type", String)
], Comment_1.Comment.prototype, "blogId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Blog_1.Blog),
    __metadata("design:type", typeof (_b = typeof Blog_1.Blog !== "undefined" && Blog_1.Blog) === "function" ? _b : Object)
], Comment_1.Comment.prototype, "blog", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'user_id',
        allowNull: false,
    }),
    __metadata("design:type", String)
], Comment_1.Comment.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", typeof (_c = typeof User_1.User !== "undefined" && User_1.User) === "function" ? _c : Object)
], Comment_1.Comment.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Comment_1.Comment.prototype, "content", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    }),
    __metadata("design:type", String)
], Comment_1.Comment.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Comment_1.Comment.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Comment_1.Comment.prototype, "updatedAt", void 0);
exports.Comment = Comment_1.Comment = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'comments',
        timestamps: true,
    })
], Comment_1.Comment);
// src/infrastructure/database/models/Promotion.ts
const sequelize_typescript_2 = require("sequelize-typescript");
const Product_1 = require("./Product");
const ProductPromotion_1 = require("./ProductPromotion");
Object.defineProperty(exports, "ProductPromotion", { enumerable: true, get: function () { return ProductPromotion_1.ProductPromotion; } });
let Promotion = class Promotion extends sequelize_typescript_1.Model {
};
exports.Promotion = Promotion;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    }),
    __metadata("design:type", String)
], Promotion_1.Promotion.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Promotion_1.Promotion.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Promotion_1.Promotion.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(5, 2),
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Promotion_1.Promotion.prototype, "discount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'start_date',
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Promotion_1.Promotion.prototype, "startDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'end_date',
        allowNull: false,
    }),
    __metadata("design:type", Date)
], Promotion_1.Promotion.prototype, "endDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Promotion_1.Promotion.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Promotion_1.Promotion.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_2.BelongsToMany)(() => Product_1.Product, () => ProductPromotion_1.ProductPromotion),
    __metadata("design:type", Array)
], Promotion_1.Promotion.prototype, "products", void 0);
exports.Promotion = Promotion_1.Promotion = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'promotions',
        timestamps: true,
    })
], Promotion_1.Promotion);
const Promotion_1 = require("./Promotion");
Object.defineProperty(exports, "Promotion", { enumerable: true, get: function () { return Promotion_1.Promotion; } });
let ProductPromotion = class ProductPromotion extends sequelize_typescript_1.Model {
};
exports.ProductPromotion = ProductPromotion;
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Promotion_1.Promotion),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'promotion_id',
        primaryKey: true,
    }),
    __metadata("design:type", String)
], ProductPromotion_1.ProductPromotion.prototype, "promotionId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Product_1.Product),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'product_id',
        primaryKey: true,
    }),
    __metadata("design:type", String)
], ProductPromotion_1.ProductPromotion.prototype, "productId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], ProductPromotion_1.ProductPromotion.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], ProductPromotion_1.ProductPromotion.prototype, "updatedAt", void 0);
exports.ProductPromotion = ProductPromotion_1.ProductPromotion = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'product_promotions',
        timestamps: true,
    })
], ProductPromotion_1.ProductPromotion);
