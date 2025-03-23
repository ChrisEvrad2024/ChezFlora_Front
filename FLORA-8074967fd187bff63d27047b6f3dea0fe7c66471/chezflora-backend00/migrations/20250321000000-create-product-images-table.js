'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('product_images', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
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
            url: {
                type: Sequelize.STRING,
                allowNull: false
            },
            order: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
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

        // Ajouter un index
        await queryInterface.addIndex('product_images', ['product_id']);
        await queryInterface.addIndex('product_images', ['order']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('product_images');
    }
};