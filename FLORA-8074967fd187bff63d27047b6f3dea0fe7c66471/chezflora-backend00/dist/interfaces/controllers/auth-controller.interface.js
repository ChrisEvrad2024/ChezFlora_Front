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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = exports.CartController = exports.ProductController = exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const register_use_case_1 = require("../../application/use-cases/auth/register.use-case");
const login_use_case_1 = require("../../application/use-cases/auth/login.use-case");
class AuthController {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate request
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        message: 'Validation error',
                        errors: errors.array()
                    });
                    return;
                }
                const { firstName, lastName, email, password, phone } = req.body;
                // Execute use case
                const registerUserUseCase = new register_use_case_1.RegisterUserUseCase(this.userRepository);
                const result = yield registerUserUseCase.execute({
                    firstName,
                    lastName,
                    email,
                    password,
                    phone
                });
                if (result.success) {
                    res.status(201).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate request
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        message: 'Validation error',
                        errors: errors.array()
                    });
                    return;
                }
                const { email, password } = req.body;
                // Execute use case
                const loginUserUseCase = new login_use_case_1.LoginUserUseCase(this.userRepository);
                const result = yield loginUserUseCase.execute({
                    email,
                    password
                });
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(401).json(result);
                }
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
}
exports.AuthController = AuthController;
const get_products_use_case_1 = require("../../application/use-cases/product/get-products.use-case");
const get_product_detail_use_case_1 = require("../../application/use-cases/product/get-product-detail.use-case");
class ProductController {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    getProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { categoryId, search } = req.query;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                // Execute use case
                const getProductsUseCase = new get_products_use_case_1.GetProductsUseCase(this.productRepository);
                const result = yield getProductsUseCase.execute({
                    categoryId: categoryId,
                    isActive: true,
                    page,
                    limit,
                    search: search
                });
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
    getProductDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Execute use case
                const getProductDetailUseCase = new get_product_detail_use_case_1.GetProductDetailUseCase(this.productRepository);
                const result = yield getProductDetailUseCase.execute({ id });
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(404).json(result);
                }
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
}
exports.ProductController = ProductController;
const add_to_cart_use_case_1 = require("../../application/use-cases/cart/add-to-cart.use-case");
class CartController {
    constructor(cartRepository, productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }
    addToCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Validate request
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        message: 'Validation error',
                        errors: errors.array()
                    });
                    return;
                }
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming req.user is set by auth middleware
                const { productId, quantity } = req.body;
                // Execute use case
                const addToCartUseCase = new add_to_cart_use_case_1.AddToCartUseCase(this.cartRepository, this.productRepository);
                const result = yield addToCartUseCase.execute({
                    userId,
                    productId,
                    quantity
                });
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
    getCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming req.user is set by auth middleware
                const cart = yield this.cartRepository.findByUserId(userId);
                if (!cart) {
                    res.status(200).json({
                        success: true,
                        message: 'Cart is empty',
                        cart: null,
                        items: []
                    });
                    return;
                }
                const items = yield this.cartRepository.getCartItems(cart.id);
                // Calculate total
                const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                res.status(200).json({
                    success: true,
                    message: 'Cart retrieved successfully',
                    cart,
                    items,
                    total
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
    updateCartItemQuantity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate request
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        message: 'Validation error',
                        errors: errors.array()
                    });
                    return;
                }
                const { id } = req.params;
                const { quantity } = req.body;
                const updatedItem = yield this.cartRepository.updateItemQuantity(id, quantity);
                res.status(200).json({
                    success: true,
                    message: quantity > 0 ? 'Cart item updated' : 'Cart item removed',
                    item: updatedItem
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
    removeCartItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const removed = yield this.cartRepository.removeItem(id);
                if (removed) {
                    res.status(200).json({
                        success: true,
                        message: 'Cart item removed successfully'
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: 'Cart item not found'
                    });
                }
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
    clearCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming req.user is set by auth middleware
                const cart = yield this.cartRepository.findByUserId(userId);
                if (!cart) {
                    res.status(200).json({
                        success: true,
                        message: 'Cart is already empty'
                    });
                    return;
                }
                yield this.cartRepository.clearCart(cart.id);
                res.status(200).json({
                    success: true,
                    message: 'Cart cleared successfully'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
}
exports.CartController = CartController;
const create_order_use_case_1 = require("../../application/use-cases/order/create-order.use-case");
class OrderController {
    constructor(orderRepository, cartRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Validate request
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    res.status(400).json({
                        success: false,
                        message: 'Validation error',
                        errors: errors.array()
                    });
                    return;
                }
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming req.user is set by auth middleware
                const { shippingAddressId, paymentMethod } = req.body;
                // Execute use case
                const createOrderUseCase = new create_order_use_case_1.CreateOrderUseCase(this.orderRepository, this.cartRepository, this.productRepository);
                const result = yield createOrderUseCase.execute({
                    userId,
                    shippingAddressId,
                    paymentMethod
                });
                if (result.success) {
                    res.status(201).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
    getOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming req.user is set by auth middleware
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const offset = (page - 1) * limit;
                const { orders, total } = yield this.orderRepository.findAll({
                    userId,
                    limit,
                    offset
                });
                const totalPages = Math.ceil(total / limit);
                res.status(200).json({
                    success: true,
                    message: 'Orders retrieved successfully',
                    orders,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
    getOrderDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming req.user is set by auth middleware
                const { id } = req.params;
                const order = yield this.orderRepository.findById(id);
                if (!order) {
                    res.status(404).json({
                        success: false,
                        message: 'Order not found'
                    });
                    return;
                }
                // Check if order belongs to user (unless admin)
                if (order.userId !== userId && ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== 'admin') {
                    res.status(403).json({
                        success: false,
                        message: 'Not authorized to access this order'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Order retrieved successfully',
                    order
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        });
    }
}
exports.OrderController = OrderController;
