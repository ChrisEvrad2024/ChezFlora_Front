'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('newsletter_subscriptions', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            token: {
                type: Sequelize.STRING,
                allowNull: true
            },
            confirmed_at: {
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

        // Ajout d'un index pour optimiser les recherches par email
        await queryInterface.addIndex('newsletter_subscriptions', ['email']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('newsletter_subscriptions');
    }
};