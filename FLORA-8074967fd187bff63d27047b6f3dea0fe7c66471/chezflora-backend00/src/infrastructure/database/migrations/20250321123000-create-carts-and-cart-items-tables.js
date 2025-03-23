'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Creation de la table des paniers
        await queryInterface.createTable('carts', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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

        // Creation de la table des articles du panier
        await queryInterface.createTable('cart_items', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            cart_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'carts',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            unit_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
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

        // Création d'un index unique pour éviter les doublons d'articles dans le panier
        await queryInterface.addIndex('cart_items', ['cart_id', 'product_id'], {
            unique: true,
            name: 'cart_items_cart_id_product_id_unique'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Suppression des tables dans l'ordre inverse de leur création
        await queryInterface.dropTable('cart_items');
        await queryInterface.dropTable('carts');
    }
};