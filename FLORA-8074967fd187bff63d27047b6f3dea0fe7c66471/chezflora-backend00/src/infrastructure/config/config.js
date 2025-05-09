// src/infrastructure/config/config.js
require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'chezflora',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql'
    },
    test: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME_TEST || 'chezflora_test',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql'
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
};