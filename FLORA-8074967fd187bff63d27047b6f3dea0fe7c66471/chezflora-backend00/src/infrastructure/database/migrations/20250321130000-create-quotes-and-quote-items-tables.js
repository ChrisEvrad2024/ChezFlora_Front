'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Création de la table des devis
        await queryInterface.createTable('quotes', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            status: {
                type: Sequelize.ENUM('requested', 'processing', 'sent', 'accepted', 'rejected', 'expired'),
                defaultValue: 'requested'
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            event_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            event_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            valid_until: {
                type: Sequelize.DATE,
                allowNull: true
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            budget: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            customer_comment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            admin_comment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            accepted_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            rejected_at: {
                type: Sequelize.DATE,
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

        // Création de la table des articles de devis
        await queryInterface.createTable('quote_items', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            quote_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'quotes',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            unit_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            total_price: {
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

        // Ajout d'index pour améliorer les performances des recherches
        await queryInterface.addIndex('quotes', ['user_id']);
        await queryInterface.addIndex('quotes', ['status']);
        await queryInterface.addIndex('quotes', ['created_at']);
        await queryInterface.addIndex('quote_items', ['quote_id']);
    },

    down: async (queryInterface, Sequelize) => {
        // Suppression des tables dans l'ordre inverse de leur création
        await queryInterface.dropTable('quote_items');
        await queryInterface.dropTable('quotes');
    }
};