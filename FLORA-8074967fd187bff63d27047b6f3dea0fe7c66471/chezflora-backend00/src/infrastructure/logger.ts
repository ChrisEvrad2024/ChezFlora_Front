import winston from 'winston';
import path from 'path';

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
winston.addColors(colors);

// Détermination du niveau de log en fonction de l'environnement
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'info';
};

// Format pour les logs de console
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Format pour les logs de fichier
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

// Configuration des transports (destinations des logs)
const transports = [
    // Console logs
    new winston.transports.Console({
        format: consoleFormat,
    }),
    // Error logs
    new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
        format: fileFormat,
    }),
    // All logs
    new winston.transports.File({
        filename: path.join('logs', 'all.log'),
        format: fileFormat,
    }),
];

// Création du logger
const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
});

export default logger;