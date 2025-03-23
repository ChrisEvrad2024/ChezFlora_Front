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
exports.AuthController = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const userData = req.body;
                const authData = yield this.authService.register(userData);
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: authData
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.login = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const authData = yield this.authService.login(email, password);
                res.status(200).json({
                    success: true,
                    message: 'Login successful',
                    data: authData
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.updateProfile = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                // Vérification que userId existe
                if (!userId) {
                    throw new error_middleware_1.AppError('Authentication required', 401);
                }
                const userData = req.body;
                const updatedUser = yield this.authService.updateProfile(userId, userData);
                res.status(200).json({
                    success: true,
                    message: 'Profile updated successfully',
                    data: updatedUser
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.requestPasswordReset = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this.authService.requestPasswordReset(email);
                res.status(200).json({
                    success: true,
                    message: 'If your email is registered, you will receive a password reset link'
                });
            }
            catch (error) {
                next(error);
            }
        });
        this.resetPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, password } = req.body;
                yield this.authService.resetPassword(token, password);
                res.status(200).json({
                    success: true,
                    message: 'Password has been reset successfully'
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
