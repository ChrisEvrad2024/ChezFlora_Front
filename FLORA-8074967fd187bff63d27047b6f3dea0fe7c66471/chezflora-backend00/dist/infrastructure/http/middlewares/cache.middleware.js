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
exports.cacheMiddleware = void 0;
const cache_service_1 = require("../../services/cache.service");
const cacheMiddleware = (ttl = 3600) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        // Ne pas mettre en cache si c'est une requête POST, PUT, DELETE
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            return next();
        }
        // Générer la clé de cache basée sur l'URL et les paramètres
        const cacheKey = `${req.originalUrl || req.url}`;
        try {
            // Vérifier si les données sont en cache
            const cachedData = yield cache_service_1.cacheService.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(cachedData);
            }
            // Stocker la fonction originale res.json pour l'intercepter
            const originalJson = res.json;
            // Remplacer res.json pour intercepter la réponse
            res.json = function (data) {
                // Restaurer la fonction originale
                res.json = originalJson;
                // Mettre en cache les données si la réponse est réussie
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cache_service_1.cacheService.set(cacheKey, data, ttl);
                }
                // Appeler la fonction originale avec les données
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            next();
        }
    });
};
exports.cacheMiddleware = cacheMiddleware;
