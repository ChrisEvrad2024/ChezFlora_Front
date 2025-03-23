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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
// Import des routes
const auth_routes_1 = __importDefault(require("./infrastructure/http/routes/auth.routes"));
// Import Middleware de gestion des erreurs
const error_middleware_1 = require("./infrastructure/http/middlewares/error.middleware");
// Import de la fonction d'initialisation de la base de données
const database_1 = require("./infrastructure/config/database");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        return __awaiter(this, void 0, void 0, function* () {
            // Middleware de base
            this.app.use((0, cors_1.default)());
            this.app.use((0, helmet_1.default)());
            this.app.use((0, compression_1.default)());
            this.app.use(express_1.default.json());
            this.app.use(express_1.default.urlencoded({ extended: true }));
            // Initialisation de la base de données
            yield (0, database_1.initDatabase)();
            // Logging en développement
            if (process.env.NODE_ENV === 'development') {
                this.app.use((0, morgan_1.default)('dev'));
            }
        });
    }
    initializeRoutes() {
        // Routes API
        this.app.use('/api/auth', auth_routes_1.default);
        // Route de base
        this.app.get('/', (req, res) => {
            res.status(200).json({ message: 'ChezFlora API is running' });
        });
        // Route pour les ressources non trouvées
        this.app.use('*', (req, res) => {
            res.status(404).json({ success: false, message: 'Resource not found' });
        });
    }
    initializeErrorHandling() {
        this.app.use(error_middleware_1.errorHandler);
    }
}
exports.default = new App().app;
