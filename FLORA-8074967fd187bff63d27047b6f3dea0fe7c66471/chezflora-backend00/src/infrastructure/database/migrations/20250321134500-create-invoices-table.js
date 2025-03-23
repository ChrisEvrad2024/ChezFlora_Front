'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('invoices', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            order_id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            invoice_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            invoice_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            due_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            tax_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0
            },
            status: {
                type: Sequelize.ENUM('pending', 'paid', 'cancelled'),
                defaultValue: 'pending'
            },
            payment_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            file_url: {
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

        // Ajout d'index
        await queryInterface.addIndex('invoices', ['invoice_number']);
        await queryInterface.addIndex('invoices', ['status']);
        await queryInterface.addIndex('invoices', ['due_date']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('invoices');
    }
};