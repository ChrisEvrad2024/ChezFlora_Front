import dotenv from 'dotenv';
import app from './app';
import { initDatabase } from './infrastructure/config/database';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Fonction de démarrage asynchrone
const startServer = async () => {
    try {
        // Initialiser la base de données avant de démarrer le serveur
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();