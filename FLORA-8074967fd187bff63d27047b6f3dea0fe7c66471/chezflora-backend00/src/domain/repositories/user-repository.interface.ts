// src/domain/repositories/user.repository.ts
import { UserEntity } from '../entities/user.entity';

export interface UserRepository {
    findAll(): Promise<UserEntity[]>;
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    create(data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
    update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null>;
    delete(id: string): Promise<boolean>;
}

// src/domain/repositories/product.repository.ts
import { ProductEntity } from '../entities/product.entity';

export interface ProductRepository {
    findAll(options?: {
        categoryId?: string;
        isActive?: boolean;
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{ products: ProductEntity[]; total: number }>;
    findById(id: string): Promise<ProductEntity | null>;
    create(data: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductEntity>;
    update(id: string, data: Partial<ProductEntity>): Promise<ProductEntity | null>;
    delete(id: string): Promise<boolean>;
    updateStock(id: string, quantity: number): Promise<ProductEntity | null>;
}

// src/domain/repositories/category.repository.ts
import { CategoryEntity } from '../entities/category.entity';

export interface CategoryRepository {
    findAll(): Promise<CategoryEntity[]>;
    findById(id: string): Promise<CategoryEntity | null>;
    create(data: Omit<CategoryEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategoryEntity>;
    update(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity | null>;
    delete(id: string): Promise<boolean>;
}

// src/domain/repositories/cart.repository.ts
import { CartEntity } from '../entities/cart.entity';
import { CartItemEntity } from '../entities/cartItem.entity';

export interface CartRepository {
    findByUserId(userId: string): Promise<CartEntity | null>;
    create(userId: string): Promise<CartEntity>;
    addItem(cartId: string, productId: string, quantity: number, unitPrice: number): Promise<CartItemEntity>;
    updateItemQuantity(cartItemId: string, quantity: number): Promise<CartItemEntity | null>;
    removeItem(cartItemId: string): Promise<boolean>;
    getCartItems(cartId: string): Promise<CartItemEntity[]>;
    clearCart(cartId: string): Promise<boolean>;
}

// src/domain/repositories/order.repository.ts
import { OrderEntity } from '../entities/order.entity';
import { OrderItemEntity } from '../entities/orderItem.entity';

export interface OrderRepository {
    findAll(options?: {
        userId?: string;
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ orders: OrderEntity[]; total: number }>;
    findById(id: string): Promise<OrderEntity | null>;
    create(data: Omit<OrderEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrderEntity>;
    addOrderItem(orderId: string, productId: string, quantity: number, unitPrice: number): Promise<OrderItemEntity>;
    getOrderItems(orderId: string): Promise<OrderItemEntity[]>;
    updateStatus(id: string, status: OrderEntity['status']): Promise<OrderEntity | null>;
}

// src/domain/repositories/quote.repository.ts
import { QuoteEntity } from '../entities/quote.entity';
import { QuoteItemEntity } from '../entities/quoteItem.entity';

export interface QuoteRepository {
    findAll(options?: {
        userId?: string;
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ quotes: QuoteEntity[]; total: number }>;
    findById(id: string): Promise<QuoteEntity | null>;
    create(data: Omit<QuoteEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<QuoteEntity>;
    update(id: string, data: Partial<QuoteEntity>): Promise<QuoteEntity | null>;
    addQuoteItem(quoteId: string, description: string, quantity: number, unitPrice: number): Promise<QuoteItemEntity>;
    getQuoteItems(quoteId: string): Promise<QuoteItemEntity[]>;
    updateStatus(id: string, status: QuoteEntity['status']): Promise<QuoteEntity | null>;
}

// src/domain/repositories/blog.repository.ts
import { BlogEntity } from '../entities/blog.entity';
import { CommentEntity } from '../entities/comment.entity';

export interface BlogRepository {
    findAll(options?: {
        status?: string;
        category?: string;
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{ blogs: BlogEntity[]; total: number }>;
    findById(id: string): Promise<BlogEntity | null>;
    create(data: Omit<BlogEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogEntity>;
    update(id: string, data: Partial<BlogEntity>): Promise<BlogEntity | null>;
    delete(id: string): Promise<boolean>;
    addComment(blogId: string, userId: string, content: string): Promise<CommentEntity>;
    getComments(blogId: string, status?: string): Promise<CommentEntity[]>;
    updateCommentStatus(commentId: string, status: CommentEntity['status']): Promise<CommentEntity | null>;
}