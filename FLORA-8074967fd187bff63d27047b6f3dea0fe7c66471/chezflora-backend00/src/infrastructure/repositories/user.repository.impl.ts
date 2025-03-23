// // src/infrastructure/repositories/user.repository.impl.ts
// import { UserRepository } from '../../domain/repositories/user.repository';
// import { UserEntity } from '../../domain/entities/user.entity';
// import { User } from '../database/models/User';

// export class SequelizeUserRepository implements UserRepository {
//     async findAll(): Promise<UserEntity[]> {
//         const users = await User.findAll();
//         return users;
//     }

//     async findById(id: string): Promise<UserEntity | null> {
//         const user = await User.findByPk(id);
//         return user;
//     }

//     async findByEmail(email: string): Promise<UserEntity | null> {
//         const user = await User.findOne({ where: { email } });
//         return user;
//     }

//     async create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
//         const user = await User.create(data as any);
//         return user;
//     }

//     async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
//         const user = await User.findByPk(id);

//         if (!user) {
//             return null;
//         }

//         await user.update(data);
//         return user;
//     }

//     async delete(id: string): Promise<boolean> {
//         const deleted = await User.destroy({ where: { id } });
//         return deleted > 0;
//     }
// }

// // src/infrastructure/repositories/product.repository.impl.ts
// import { Op } from 'sequelize';
// import { ProductRepository } from '../../domain/repositories/product.repository';
// import { ProductEntity } from '../../domain/entities/product.entity';
// import { Product } from '../database/models/Product';
// import { ProductImage } from '../database/models/ProductImage';
// import { Category } from '../database/models/Category';

// export class SequelizeProductRepository implements ProductRepository {
//     async findAll(options?: {
//         categoryId?: string;
//         isActive?: boolean;
//         limit?: number;
//         offset?: number;
//         search?: string;
//     }): Promise<{ products: ProductEntity[]; total: number }> {
//         const whereClause: any = {};

//         if (options?.categoryId) {
//             whereClause.categoryId = options.categoryId;
//         }

//         if (options?.isActive !== undefined) {
//             whereClause.isActive = options.isActive;
//         }

//         if (options?.search) {
//             whereClause.name = { [Op.like]: `%${options.search}%` };
//         }

//         const { rows, count } = await Product.findAndCountAll({
//             where: whereClause,
//             limit: options?.limit,
//             offset: options?.offset,
//             include: [
//                 { model: ProductImage },
//                 { model: Category }
//             ],
//             order: [['createdAt', 'DESC']]
//         });

//         return {
//             products: rows,
//             total: count
//         };
//     }

//     async findById(id: string): Promise<ProductEntity | null> {
//         const product = await Product.findByPk(id, {
//             include: [
//                 { model: ProductImage },
//                 { model: Category }
//             ]
//         });

//         return product;
//     }

//     async create(data: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity> {
//         const product = await Product.create(data as any);
//         return product;
//     }

//     async update(id: string, data: Partial<ProductEntity>): Promise<ProductEntity | null> {
//         const product = await Product.findByPk(id);

//         if (!product) {
//             return null;
//         }

//         await product.update(data);
//         return product;
//     }

//     async delete(id: string): Promise<boolean> {
//         const deleted = await Product.destroy({ where: { id } });
//         return deleted > 0;
//     }

//     async updateStock(id: string, quantity: number): Promise<ProductEntity | null> {
//         const product = await Product.findByPk(id);

//         if (!product) {
//             return null;
//         }

//         product.stock = Math.max(0, product.stock + quantity);
//         await product.save();

//         return product;
//     }
// }

// // src/infrastructure/repositories/cart.repository.impl.ts
// import { CartRepository } from '../../domain/repositories/cart.repository';
// import { CartEntity } from '../../domain/entities/cart.entity';
// import { CartItemEntity } from '../../domain/entities/cartItem.entity';
// import { Cart } from '../database/models/Cart';
// import { CartItem } from '../database/models/CartItem';
// import { Product } from '../database/models/Product';

// export class SequelizeCartRepository implements CartRepository {
//     async findByUserId(userId: string): Promise<CartEntity | null> {
//         const cart = await Cart.findOne({
//             where: { userId },
//             include: [
//                 {
//                     model: CartItem,
//                     include: [Product]
//                 }
//             ]
//         });

//         return cart;
//     }

//     async create(userId: string): Promise<CartEntity> {
//         const cart = await Cart.create({ userId });
//         return cart;
//     }

//     async addItem(cartId: string, productId: string, quantity: number, unitPrice: number): Promise<CartItemEntity> {
//         // Check if item already exists
//         const existingItem = await CartItem.findOne({
//             where: {
//                 cartId,
//                 productId
//             }
//         });

//         if (existingItem) {
//             existingItem.quantity += quantity;
//             await existingItem.save();
//             return existingItem;
//         }

//         const cartItem = await CartItem.create({
//             cartId,
//             productId,
//             quantity,
//             unitPrice
//         });

//         return cartItem;
//     }

//     async updateItemQuantity(cartItemId: string, quantity: number): Promise<CartItemEntity | null> {
//         const cartItem = await CartItem.findByPk(cartItemId);

//         if (!cartItem) {
//             return null;
//         }

//         if (quantity <= 0) {
//             await cartItem.destroy();
//             return null;
//         }

//         cartItem.quantity = quantity;
//         await cartItem.save();

//         return cartItem;
//     }

//     async removeItem(cartItemId: string): Promise<boolean> {
//         const deleted = await CartItem.destroy({ where: { id: cartItemId } });
//         return deleted > 0;
//     }

//     async getCartItems(cartId: string): Promise<CartItemEntity[]> {
//         const items = await CartItem.findAll({
//             where: { cartId },
//             include: [Product]
//         });

//         return items;
//     }

//     async clearCart(cartId: string): Promise<boolean> {
//         const deleted = await CartItem.destroy({ where: { cartId } });
//         return deleted > 0;
//     }
// }

// // src/infrastructure/repositories/order.repository.impl.ts
// import { OrderRepository } from '../../domain/repositories/order.repository';
// import { OrderEntity } from '../../domain/entities/order.entity';
// import { OrderItemEntity } from '../../domain/entities/orderItem.entity';
// import { Order } from '../database/models/Order';
// import { OrderItem } from '../database/models/OrderItem';
// import { Product } from '../database/models/Product';
// import { User } from '../database/models/User';
// import { Address } from '../database/models/Address';

// export class SequelizeOrderRepository implements OrderRepository {
//     async findAll(options?: {
//         userId?: string;
//         status?: string;
//         limit?: number;
//         offset?: number;
//     }): Promise<{ orders: OrderEntity[]; total: number }> {
//         const whereClause: any = {};

//         if (options?.userId) {
//             whereClause.userId = options.userId;
//         }

//         if (options?.status) {
//             whereClause.status = options.status;
//         }

//         const { rows, count } = await Order.findAndCountAll({
//             where: whereClause,
//             limit: options?.limit,
//             offset: options?.offset,
//             include: [
//                 { model: User },
//                 { model: Address },
//                 {
//                     model: OrderItem,
//                     include: [Product]
//                 }
//             ],
//             order: [['createdAt', 'DESC']]
//         });

//         return {
//             orders: rows,
//             total: count
//         };
//     }

//     async findById(id: string): Promise<OrderEntity | null> {
//         const order = await Order.findByPk(id, {
//             include: [
//                 { model: User },
//                 { model: Address },
//                 {
//                     model: OrderItem,
//                     include: [Product]
//                 }
//             ]
//         });

//         return order;
//     }

//     async create(data: Omit<OrderEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderEntity> {
//         const order = await Order.create(data as any);
//         return order;
//     }

//     async addOrderItem(orderId: string, productId: string, quantity: number, unitPrice: number): Promise<OrderItemEntity> {
//         const orderItem = await OrderItem.create({
//             orderId,
//             productId,
//             quantity,
//             unitPrice
//         });

//         return orderItem;
//     }

//     async getOrderItems(orderId: string): Promise<OrderItemEntity[]> {
//         const items = await OrderItem.findAll({
//             where: { orderId },
//             include: [Product]
//         });

//         return items;
//     }

//     async updateStatus(id: string, status: OrderEntity['status']): Promise<OrderEntity | null> {
//         const order = await Order.findByPk(id);

//         if (!order) {
//             return null;
//         }

//         order.status = status;
//         await order.save();

//         return order;
//     }
// }