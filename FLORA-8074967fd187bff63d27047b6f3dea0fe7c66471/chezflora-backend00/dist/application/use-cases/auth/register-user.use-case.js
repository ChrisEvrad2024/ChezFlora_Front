"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestQuoteUseCase = exports.CreateOrderUseCase = exports.AddToCartUseCase = exports.GetProductDetailUseCase = exports.GetProductsUseCase = exports.LoginUserUseCase = exports.RegisterUserUseCase = void 0;
class RegisterUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if user with same email already exists
                const existingUser = yield this.userRepository.findByEmail(input.email);
                if (existingUser) {
                    return {
                        success: false,
                        message: 'Email already registered'
                    };
                }
                // Create new user
                const user = yield this.userRepository.create({
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
                const { password } = user, userWithoutPassword = __rest(user, ["password"]);
                return {
                    success: true,
                    message: 'User registered successfully',
                    user: userWithoutPassword
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                };
            }
        });
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
// src/application/use-cases/auth/login.use-case.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class LoginUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find user by email
                const user = yield this.userRepository.findByEmail(input.email);
                if (!user) {
                    return {
                        success: false,
                        message: 'Invalid email or password'
                    };
                }
                // Check if user is active
                if (user.status !== 'active') {
                    return {
                        success: false,
                        message: 'Account is not active'
                    };
                }
                // Verify password
                const isPasswordValid = yield user.comparePassword(input.password);
                if (!isPasswordValid) {
                    return {
                        success: false,
                        message: 'Invalid email or password'
                    };
                }
                // Update last login time
                yield this.userRepository.update(user.id, {
                    lastLogin: new Date()
                });
                // Generate JWT token
                const token = jsonwebtoken_1.default.sign({
                    id: user.id,
                    email: user.email,
                    role: user.role
                }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
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
            }
            catch (error) {
                return {
                    success: false,
                    message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                };
            }
        });
    }
}
exports.LoginUserUseCase = LoginUserUseCase;
class GetProductsUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = input.page || 1;
                const limit = input.limit || 10;
                const offset = (page - 1) * limit;
                const { products, total } = yield this.productRepository.findAll({
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
            }
            catch (error) {
                return {
                    success: false,
                    message: `Failed to retrieve products: ${error instanceof Error ? error.message : 'Unknown error'}`
                };
            }
        });
    }
}
exports.GetProductsUseCase = GetProductsUseCase;
class GetProductDetailUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const product = yield this.productRepository.findById(input.id);
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
            }
            catch (error) {
                return {
                    success: false,
                    message: `Failed to retrieve product: ${error instanceof Error ? error.message : 'Unknown error'}`
                };
            }
        });
    }
}
exports.GetProductDetailUseCase = GetProductDetailUseCase;
class AddToCartUseCase {
    constructor(cartRepository, productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if product exists and is in stock
                const product = yield this.productRepository.findById(input.productId);
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
                let cart = yield this.cartRepository.findByUserId(input.userId);
                if (!cart) {
                    cart = yield this.cartRepository.create(input.userId);
                }
                // Add item to cart
                const cartItem = yield this.cartRepository.addItem(cart.id, input.productId, input.quantity, product.price);
                return {
                    success: true,
                    message: 'Item added to cart successfully',
                    cartItem
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: `Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`
                };
            }
        });
    }
}
exports.AddToCartUseCase = AddToCartUseCase;
class CreateOrderUseCase {
    constructor(orderRepository, cartRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get user's cart
                const cart = yield this.cartRepository.findByUserId(input.userId);
                if (!cart) {
                    return {
                        success: false,
                        message: 'Cart not found or empty'
                    };
                }
                // Get cart items
                const cartItems = yield this.cartRepository.getCartItems(cart.id);
                if (!cartItems.length) {
                    return {
                        success: false,
                        message: 'Cart is empty'
                    };
                }
                // Verify stock availability for all items
                for (const item of cartItems) {
                    const product = yield this.productRepository.findById(item.productId);
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
                const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                // Create order
                const order = yield this.orderRepository.create({
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
                    yield this.orderRepository.addOrderItem(order.id, item.productId, item.quantity, item.unitPrice);
                    // Update product stock
                    yield this.productRepository.updateStock(item.productId, -item.quantity);
                }
                // Clear cart
                yield this.cartRepository.clearCart(cart.id);
                return {
                    success: true,
                    message: 'Order created successfully',
                    order
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: `Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`
                };
            }
        });
    }
}
exports.CreateOrderUseCase = CreateOrderUseCase;
class RequestQuoteUseCase {
    constructor(quoteRepository) {
        this.quoteRepository = quoteRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Calculate validity date (30 days from now)
                const validUntil = new Date();
                validUntil.setDate(validUntil.getDate() + 30);
                // Create quote
                const quote = yield this.quoteRepository.create({
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
            }
            catch (error) {
                return {
                    success: false,
                    message: `Failed to submit quote request: ${error instanceof Error ? error.message : 'Unknown error'}`
                };
            }
        });
    }
}
exports.RequestQuoteUseCase = RequestQuoteUseCase;
