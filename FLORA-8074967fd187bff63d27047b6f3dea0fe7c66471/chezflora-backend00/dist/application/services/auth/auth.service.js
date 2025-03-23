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
exports.AuthService = void 0;
const error_middleware_1 = require("../../../infrastructure/http/middlewares/error.middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Vérifier si l'email existe déjà
            const existingUser = yield this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new error_middleware_1.AppError('Email already in use', 400);
            }
            // Créer l'utilisateur
            const user = yield this.userRepository.create(Object.assign(Object.assign({}, userData), { role: 'client', status: 'active' }));
            // Générer le token
            const token = this.generateToken(user);
            // Retourner les données sans le mot de passe
            const _a = user, { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
            return {
                user: userWithoutPassword,
                token,
            };
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // Trouver l'utilisateur par email
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                throw new error_middleware_1.AppError('Invalid email or password', 401);
            }
            // Vérifier si l'utilisateur est actif
            if (user.status !== 'active') {
                throw new error_middleware_1.AppError('Account is not active', 401);
            }
            // Vérifier le mot de passe avec bcrypt
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw new error_middleware_1.AppError('Invalid email or password', 401);
            }
            // Mettre à jour la date de dernière connexion
            yield this.userRepository.update(user.id, { lastLogin: new Date() });
            // Générer le token
            const token = this.generateToken(user);
            // Retourner les données sans le mot de passe
            const _a = user, { password: pwd } = _a, userWithoutPassword = __rest(_a, ["password"]);
            return {
                user: userWithoutPassword,
                token,
            };
        });
    }
    verifyToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                return this.userRepository.findById(decoded.id);
            }
            catch (error) {
                return null;
            }
        });
    }
    updateProfile(userId, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findById(userId);
            if (!user) {
                throw new error_middleware_1.AppError('User not found', 404);
            }
            // Vérifier si l'email est déjà utilisé
            if (userData.email && userData.email !== user.email) {
                const existingUser = yield this.userRepository.findByEmail(userData.email);
                if (existingUser) {
                    throw new error_middleware_1.AppError('Email already in use', 400);
                }
            }
            // Mettre à jour l'utilisateur
            const updatedUser = yield this.userRepository.update(userId, userData);
            if (!updatedUser) {
                throw new error_middleware_1.AppError('User update failed', 500);
            }
            // Retourner les données sans le mot de passe
            const _a = updatedUser, { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
            return userWithoutPassword;
        });
    }
    requestPasswordReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                // Ne pas révéler que l'email n'existe pas
                return true;
            }
            // Générer un token unique
            const resetToken = crypto_1.default.randomBytes(32).toString('hex');
            const hashedToken = yield bcrypt_1.default.hash(resetToken, 10);
            // Définir l'expiration à 1 heure
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            // Enregistrer le token dans la base de données
            yield this.userRepository.update(user.id, {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expiresAt,
            });
            // En production, vous enverriez un email avec le lien de réinitialisation
            // contenant le token resetToken (non haché)
            console.log(`Reset token for ${email}: ${resetToken}`);
            return true;
        });
    }
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByResetToken(token);
            if (!user) {
                throw new error_middleware_1.AppError('Invalid or expired token', 400);
            }
            // Mettre à jour le mot de passe et supprimer le token
            yield this.userRepository.update(user.id, {
                password: newPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });
            return true;
        });
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    }
}
exports.AuthService = AuthService;
