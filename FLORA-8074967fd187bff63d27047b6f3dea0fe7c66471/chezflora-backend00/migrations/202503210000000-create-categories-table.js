'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('categories', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            image: {
                type: Sequelize.STRING,
                allowNull: true
            },
            parent_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });

        // Ajouter des index
        await queryInterface.addIndex('categories', ['parent_id']);
        await queryInterface.addIndex('categories', ['name']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('categories');
    }
};