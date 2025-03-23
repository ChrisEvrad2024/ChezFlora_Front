// // src/infrastructure/database/models/Blog.ts
// import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
// import { v4 as uuidv4 } from 'uuid';
// import { BlogEntity } from '../../../domain/entities/blog.entity';
// import { User } from './user.model';
// import { Comment } from './Comment';

// @Table({
//     tableName: 'blogs',
//     timestamps: true,
// })
// export class Blog extends Model implements BlogEntity {
//     @Column({
//         type: DataType.STRING,
//         primaryKey: true,
//         defaultValue: () => uuidv4(),
//     })
//     id!: string;

//     @ForeignKey(() => User)
//     @Column({
//         type: DataType.STRING,
//         field: 'author_id',
//         allowNull: false,
//     })
//     authorId!: string;

//     @BelongsTo(() => User)
//     author!: User;

//     @Column({
//         type: DataType.STRING,
//         allowNull: false,
//     })
//     title!: string;

//     @Column({
//         type: DataType.TEXT,
//         allowNull: false,
//     })
//     content!: string;

//     @Column({
//         type: DataType.DATE,
//         field: 'publish_date',
//         allowNull: true,
//     })
//     publishDate?: Date;

//     @Column({
//         type: DataType.STRING,
//         allowNull: false,
//     })
//     category!: string;

//     @Column({
//         type: DataType.ENUM('draft', 'pending', 'published', 'rejected', 'archived'),
//         defaultValue: 'draft',
//     })
//     status!: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

//     @Column({
//         type: DataType.DATE,
//         field: 'created_at',
//         defaultValue: DataType.NOW,
//     })
//     createdAt!: Date;

//     @Column({
//         type: DataType.DATE,
//         field: 'updated_at',
//         defaultValue: DataType.NOW,
//     })
//     updatedAt!: Date;

//     @HasMany(() => Comment)
//     comments!: Comment[];
// }

// // src/infrastructure/database/models/Comment.ts
// import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
// import { v4 as uuidv4 } from 'uuid';
// import { CommentEntity } from '../../../domain/entities/comment.entity';
// import { Blog } from './Blog';
// import { User } from './user.model';

// @Table({
//     tableName: 'comments',
//     timestamps: true,
// })
// export class Comment extends Model implements CommentEntity {
//     @Column({
//         type: DataType.STRING,
//         primaryKey: true,
//         defaultValue: () => uuidv4(),
//     })
//     id!: string;

//     @ForeignKey(() => Blog)
//     @Column({
//         type: DataType.STRING,
//         field: 'blog_id',
//         allowNull: false,
//     })
//     blogId!: string;

//     @BelongsTo(() => Blog)
//     blog!: Blog;

//     @ForeignKey(() => User)
//     @Column({
//         type: DataType.STRING,
//         field: 'user_id',
//         allowNull: false,
//     })
//     userId!: string;

//     @BelongsTo(() => User)
//     user!: User;

//     @Column({
//         type: DataType.TEXT,
//         allowNull: false,
//     })
//     content!: string;

//     @Column({
//         type: DataType.ENUM('pending', 'approved', 'rejected'),
//         defaultValue: 'pending',
//     })
//     status!: 'pending' | 'approved' | 'rejected';

//     @Column({
//         type: DataType.DATE,
//         field: 'created_at',
//         defaultValue: DataType.NOW,
//     })
//     createdAt!: Date;

//     @Column({
//         type: DataType.DATE,
//         field: 'updated_at',
//         defaultValue: DataType.NOW,
//     })
//     updatedAt!: Date;
// }

// // src/infrastructure/database/models/Promotion.ts
// import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
// import { v4 as uuidv4 } from 'uuid';
// import { PromotionEntity } from '../../../domain/entities/promotion.entity';
// import { Product } from './Product';
// import { ProductPromotion } from './ProductPromotion';

// @Table({
//     tableName: 'promotions',
//     timestamps: true,
// })
// export class Promotion extends Model implements PromotionEntity {
//     @Column({
//         type: DataType.STRING,
//         primaryKey: true,
//         defaultValue: () => uuidv4(),
//     })
//     id!: string;

//     @Column({
//         type: DataType.STRING,
//         allowNull: false,
//     })
//     name!: string;

//     @Column({
//         type: DataType.TEXT,
//         allowNull: false,
//     })
//     description!: string;

//     @Column({
//         type: DataType.DECIMAL(5, 2),
//         allowNull: false,
//     })
//     discount!: number;

//     @Column({
//         type: DataType.DATE,
//         field: 'start_date',
//         allowNull: false,
//     })
//     startDate!: Date;

//     @Column({
//         type: DataType.DATE,
//         field: 'end_date',
//         allowNull: false,
//     })
//     endDate!: Date;

//     @Column({
//         type: DataType.DATE,
//         field: 'created_at',
//         defaultValue: DataType.NOW,
//     })
//     createdAt!: Date;

//     @Column({
//         type: DataType.DATE,
//         field: 'updated_at',
//         defaultValue: DataType.NOW,
//     })
//     updatedAt!: Date;

//     @BelongsToMany(() => Product, () => ProductPromotion)
//     products!: Product[];
// }

// // src/infrastructure/database/models/ProductPromotion.ts
// import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
// import { ProductPromotionEntity } from '../../../domain/entities/productPromotion.entity';
// import { Product } from './Product';
// import { Promotion } from './Promotion';

// @Table({
//     tableName: 'product_promotions',
//     timestamps: true,
// })
// export class ProductPromotion extends Model implements ProductPromotionEntity {
//     @ForeignKey(() => Promotion)
//     @Column({
//         type: DataType.STRING,
//         field: 'promotion_id',
//         primaryKey: true,
//     })
//     promotionId!: string;

//     @ForeignKey(() => Product)
//     @Column({
//         type: DataType.STRING,
//         field: 'product_id',
//         primaryKey: true,
//     })
//     productId!: string;

//     @Column({
//         type: DataType.DATE,
//         field: 'created_at',
//         defaultValue: DataType.NOW,
//     })
//     createdAt!: Date;

//     @Column({
//         type: DataType.DATE,
//         field: 'updated_at',
//         defaultValue: DataType.NOW,
//     })
//     updatedAt!: Date;
// }