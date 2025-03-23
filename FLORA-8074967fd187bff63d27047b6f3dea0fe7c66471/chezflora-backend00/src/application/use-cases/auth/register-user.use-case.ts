// src/application/use-cases/auth/register.use-case.ts
import bcrypt from 'bcrypt';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';

interface RegisterUserInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
}

interface RegisterUserOutput {
    success: boolean;
    message: string;
    user?: Omit<UserEntity, 'password'>;
}

export class RegisterUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
        try {
            // Check if user with same email already exists
            const existingUser = await this.userRepository.findByEmail(input.email);

            if (existingUser) {
                return {
                    success: false,
                    message: 'Email already registered'
                };
            }

            // Create new user
            const user = await this.userRepository.create({
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email,
                password: input.password, // Password will be hashed by the model before save
                phone: input.phone,
                role: 'client',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Return user without password
            const { password, ...userWithoutPassword } = user;

            return {
                success: true,
                message: 'User registered successfully',
                user: userWithoutPassword as Omit<UserEntity, 'password'>
            };
        } catch (error) {
            return {
                success: false,
                message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}

// src/application/use-cases/auth/login.use-case.ts
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../infrastructure/database/models/User';

interface LoginUserInput {
    email: string;
    password: string;
}

interface LoginUserOutput {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
}

export class LoginUserUseCase {
    constructor(private readonly userRepository: UserRepository) { }

    async execute(input: LoginUserInput): Promise<LoginUserOutput> {
        try {
            // Find user by email
            const user = await this.userRepository.findByEmail(input.email);

            if (!user) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            // Check if user is active
            if ((user as User).status !== 'active') {
                return {
                    success: false,
                    message: 'Account is not active'
                };
            }

            // Verify password
            const isPasswordValid = await (user as User).comparePassword(input.password);

            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid email or password'
                };
            }

            // Update last login time
            await this.userRepository.update(user.id, {
                lastLogin: new Date()
            });

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '1d' }
            );

            return {
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}

// src/application/use-cases/product/get-products.use-case.ts
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { ProductEntity } from '../../../domain/entities/product.entity';

interface GetProductsInput {
    categoryId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
}

interface GetProductsOutput {
    success: boolean;
    message: string;
    products?: ProductEntity[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class GetProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) { }

    async execute(input: GetProductsInput): Promise<GetProductsOutput> {
        try {
            const page = input.page || 1;
            const limit = input.limit || 10;
            const offset = (page - 1) * limit;

            const { products, total } = await this.productRepository.findAll({
                categoryId: input.categoryId,
                isActive: input.isActive !== undefined ? input.isActive : true,
                limit,
                offset,
                search: input.search
            });

            const totalPages = Math.ceil(total / limit);

            return {
                success: true,
                message: 'Products retrieved successfully',
                products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to retrieve products: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}

// src/application/use-cases/product/get-product-detail.use-case.ts
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { ProductEntity } from '../../../domain/entities/product.entity';

interface GetProductDetailInput {
    id: string;
}

interface GetProductDetailOutput {
    success: boolean;
    message: string;
    product?: ProductEntity;
}

export class GetProductDetailUseCase {
    constructor(private readonly productRepository: ProductRepository) { }

    async execute(input: GetProductDetailInput): Promise<GetProductDetailOutput> {
        try {
            const product = await this.productRepository.findById(input.id);

            if (!product) {
                return {
                    success: false,
                    message: 'Product not found'
                };
            }

            return {
                success: true,
                message: 'Product retrieved successfully',
                product
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to retrieve product: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}

// src/application/use-cases/cart/add-to-cart.use-case.ts
import { CartRepository } from '../../../domain/repositories/cart.repository';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { CartItemEntity } from '../../../domain/entities/cartItem.entity';

interface AddToCartInput {
    userId: string;
    productId: string;
    quantity: number;
}

interface AddToCartOutput {
    success: boolean;
    message: string;
    cartItem?: CartItemEntity;
}

export class AddToCartUseCase {
    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository
    ) { }

    async execute(input: AddToCartInput): Promise<AddToCartOutput> {
        try {
            // Check if product exists and is in stock
            const product = await this.productRepository.findById(input.productId);

            if (!product) {
                return {
                    success: false,
                    message: 'Product not found'
                };
            }

            if (!product.isActive) {
                return {
                    success: false,
                    message: 'Product is not available'
                };
            }

            if (product.stock < input.quantity) {
                return {
                    success: false,
                    message: `Not enough stock available. Only ${product.stock} items left.`
                };
            }

            // Get user's cart or create one if it doesn't exist
            let cart = await this.cartRepository.findByUserId(input.userId);

            if (!cart) {
                cart = await this.cartRepository.create(input.userId);
            }

            // Add item to cart
            const cartItem = await this.cartRepository.addItem(
                cart.id,
                input.productId,
                input.quantity,
                product.price
            );

            return {
                success: true,
                message: 'Item added to cart successfully',
                cartItem
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}

// src/application/use-cases/order/create-order.use-case.ts
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { CartRepository } from '../../../domain/repositories/cart.repository';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { OrderEntity } from '../../../domain/entities/order.entity';
import { CartItemEntity } from '../../../domain/entities/cartItem.entity';

interface CreateOrderInput {
    userId: string;
    shippingAddressId: string;
    paymentMethod: string;
}

interface CreateOrderOutput {
    success: boolean;
    message: string;
    order?: OrderEntity;
}

export class CreateOrderUseCase {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository
    ) { }

    async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
        try {
            // Get user's cart
            const cart = await this.cartRepository.findByUserId(input.userId);

            if (!cart) {
                return {
                    success: false,
                    message: 'Cart not found or empty'
                };
            }

            // Get cart items
            const cartItems = await this.cartRepository.getCartItems(cart.id);

            if (!cartItems.length) {
                return {
                    success: false,
                    message: 'Cart is empty'
                };
            }

            // Verify stock availability for all items
            for (const item of cartItems) {
                const product = await this.productRepository.findById(item.productId);

                if (!product || !product.isActive) {
                    return {
                        success: false,
                        message: `Product ${item.productId} is not available`
                    };
                }

                if (product.stock < item.quantity) {
                    return {
                        success: false,
                        message: `Not enough stock for product ${product.name}. Only ${product.stock} items left.`
                    };
                }
            }

            // Calculate total amount
            const totalAmount = cartItems.reduce(
                (sum, item) => sum + (item.quantity * item.unitPrice),
                0
            );

            // Create order
            const order = await this.orderRepository.create({
                userId: input.userId,
                status: 'pending',
                totalAmount,
                shippingAddressId: input.shippingAddressId,
                paymentMethod: input.paymentMethod,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Add order items
            for (const item of cartItems) {
                await this.orderRepository.addOrderItem(
                    order.id,
                    item.productId,
                    item.quantity,
                    item.unitPrice
                );

                // Update product stock
                await this.productRepository.updateStock(item.productId, -item.quantity);
            }

            // Clear cart
            await this.cartRepository.clearCart(cart.id);

            return {
                success: true,
                message: 'Order created successfully',
                order
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}

// src/application/use-cases/quote/request-quote.use-case.ts
import { QuoteRepository } from '../../../domain/repositories/quote.repository';
import { QuoteEntity } from '../../../domain/entities/quote.entity';

interface RequestQuoteInput {
    userId: string;
    description: string;
    eventType: string;
    eventDate: Date;
    budget?: number;
    customerComment?: string;
}

interface RequestQuoteOutput {
    success: boolean;
    message: string;
    quote?: QuoteEntity;
}

export class RequestQuoteUseCase {
    constructor(private readonly quoteRepository: QuoteRepository) { }

    async execute(input: RequestQuoteInput): Promise<RequestQuoteOutput> {
        try {
            // Calculate validity date (30 days from now)
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + 30);

            // Create quote
            const quote = await this.quoteRepository.create({
                userId: input.userId,
                status: 'requested',
                description: input.description,
                eventType: input.eventType,
                eventDate: input.eventDate,
                validUntil,
                budget: input.budget,
                customerComment: input.customerComment,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            return {
                success: true,
                message: 'Quote request submitted successfully',
                quote
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to submit quote request: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}