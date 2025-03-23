'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Créer les mots de passe hachés
        const saltRounds = 10;
        const password = await bcrypt.hash('00000000', saltRounds);

        return queryInterface.bulkInsert('users', [
            {
                id: uuidv4(),
                first_name: 'omgba',
                last_name: 'omgba',
                email: 'omgba@gmail.com',
                password: password,
                phone: 'omgba',
                role: 'super_admin',
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                first_name: 'omgbaa',
                last_name: 'omgbaa',
                email: 'omgbaa@gmail.com',
                password: password,
                phone: '00000000',
                role: 'admin',
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('users', {
            email: ['omgba@gmail.com', 'omgbaa@gmail.com']
        }, {});
    }
};