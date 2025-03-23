import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../../services/cache.service';

export const cacheMiddleware = (ttl: number = 3600) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Ne pas mettre en cache si c'est une requête POST, PUT, DELETE
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            return next();
        }

        // Générer la clé de cache basée sur l'URL et les paramètres
        const cacheKey = `${req.originalUrl || req.url}`;

        try {
            // Vérifier si les données sont en cache
            const cachedData = await cacheService.get(cacheKey);

            if (cachedData) {
                return res.status(200).json(cachedData);
            }

            // Stocker la fonction originale res.json pour l'intercepter
            const originalJson = res.json;

            // Remplacer res.json pour intercepter la réponse
            res.json = function (data): Response {
                // Restaurer la fonction originale
                res.json = originalJson;

                // Mettre en cache les données si la réponse est réussie
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cacheService.set(cacheKey, data, ttl);
                }

                // Appeler la fonction originale avec les données
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            next();
        }
    };
};