"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Définition des niveaux de log et leurs couleurs
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Définition des couleurs pour chaque niveau
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
// Ajout des couleurs à Winston
winston_1.default.addColors(colors);
// Détermination du niveau de log en fonction de l'environnement
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'info';
};
// Format pour les logs de console
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Format pour les logs de fichier
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.json());
// Configuration des transports (destinations des logs)
const transports = [
    // Console logs
    new winston_1.default.transports.Console({
        format: consoleFormat,
    }),
    // Error logs
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'error.log'),
        level: 'error',
        format: fileFormat,
    }),
    // All logs
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'all.log'),
        format: fileFormat,
    }),
];
// Création du logger
const logger = winston_1.default.createLogger({
    level: level(),
    levels,
    transports,
});
exports.default = logger;
