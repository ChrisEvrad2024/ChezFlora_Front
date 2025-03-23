'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Création de la table des catégories
        await queryInterface.createTable('categories', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            image: {
                type: Sequelize.STRING,
                allowNull: true
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

        // Création de la table des produits
        await queryInterface.createTable('products', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            category_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            stock: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            image: {
                type: Sequelize.STRING,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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

        // Ajout d'index pour améliorer les performances des recherches
        await queryInterface.addIndex('products', ['name']);
        await queryInterface.addIndex('products', ['category_id']);
        await queryInterface.addIndex('products', ['is_active']);
    },

    down: async (queryInterface, Sequelize) => {
        // Suppression des tables dans l'ordre inverse de leur création
        await queryInterface.dropTable('products');
        await queryInterface.dropTable('categories');
    }
};