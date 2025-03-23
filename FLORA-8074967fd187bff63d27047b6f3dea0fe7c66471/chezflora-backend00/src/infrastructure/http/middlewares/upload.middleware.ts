// src/infrastructure/http/middlewares/upload.middleware.ts
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from './error.middleware';
import express from 'express';

// Créer le dossier d'upload s'il n'existe pas
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const productImagesDir = path.join(uploadDir, 'products');
if (!fs.existsSync(productImagesDir)) {
    fs.mkdirSync(productImagesDir, { recursive: true });
}

const categoryImagesDir = path.join(uploadDir, 'categories');
if (!fs.existsSync(categoryImagesDir)) {
    fs.mkdirSync(categoryImagesDir, { recursive: true });
}

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Déterminer le dossier de destination en fonction du type d'upload
        let destinationPath = uploadDir;
        
        if (req.originalUrl.includes('/products')) {
            destinationPath = productImagesDir;
        } else if (req.originalUrl.includes('/categories')) {
            destinationPath = categoryImagesDir;
        }
        
        cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        cb(null, fileName);
    }
});

// Filtrer les types de fichiers autorisés
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accepter uniquement les images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

// Configuration du middleware multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Middleware d'upload d'image unique
export const uploadSingleImage = (fieldName: string = 'image') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const uploadMiddleware = upload.single(fieldName);

        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // Erreur multer
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new AppError('File size exceeds limit of 5MB', 400));
                }
                return next(new AppError(`Upload error: ${err.message}`, 400));
            } else if (err) {
                // Autre erreur
                return next(new AppError(err.message, 400));
            }

            // Ajouter l'URL de l'image au corps de la requête
            if (req.file) {
                // Construire l'URL relative pour accéder à l'image
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                const relativePath = `/uploads/${req.originalUrl.includes('/products') ? 'products' : 'categories'}/${req.file.filename}`;
                
                req.body.imageUrl = `${baseUrl}${relativePath}`;
            }

            next();
        });
    };
};

// Middleware d'upload de plusieurs images
export const uploadMultipleImages = (fieldName: string = 'images', maxCount: number = 5) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const uploadMiddleware = upload.array(fieldName, maxCount);

        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                // Erreur multer
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new AppError('File size exceeds limit of 5MB', 400));
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    return next(new AppError(`Too many files. Maximum allowed: ${maxCount}`, 400));
                }
                return next(new AppError(`Upload error: ${err.message}`, 400));
            } else if (err) {
                // Autre erreur
                return next(new AppError(err.message, 400));
            }

            // Ajouter les URLs des images au corps de la requête
            if (req.files && Array.isArray(req.files)) {
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                const folderPath = req.originalUrl.includes('/products') ? 'products' : 'categories';
                
                req.body.imageUrls = req.files.map(file => {
                    const relativePath = `/uploads/${folderPath}/${file.filename}`;
                    return `${baseUrl}${relativePath}`;
                });
            }

            next();
        });
    };
};

// Mettre à jour le routeur Express pour servir les fichiers statiques
export const configureStaticFiles = (app: any) => {
    app.use('/uploads', express.static(uploadDir));
};