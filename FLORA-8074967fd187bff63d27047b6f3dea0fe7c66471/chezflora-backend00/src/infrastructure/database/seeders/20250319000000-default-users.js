// src/infrastructure/database/seeders/YYYYMMDDHHMMSS-default-users.js
'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Créer les mots de passe hachés
        const saltRounds = 10;
        const defaultPassword = await bcrypt.hash('Password123!', saltRounds);

        return queryInterface.bulkInsert('users', [
            {
                id: uuidv4(),
                first_name: 'Super',
                last_name: 'Admin',
                email: 'super.admin@chezflora.com',
                password: defaultPassword,
                role: 'super_admin',
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                first_name: 'Admin',
                last_name: 'User',
                email: 'admin@chezflora.com',
                password: defaultPassword,
                role: 'admin',
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                first_name: 'Client',
                last_name: 'User',
                email: 'client@chezflora.com',
                password: defaultPassword,
                role: 'client',
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('users', null, {});
    }
};