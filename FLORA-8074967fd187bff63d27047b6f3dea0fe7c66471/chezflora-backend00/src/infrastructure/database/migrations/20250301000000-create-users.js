// src/infrastructure/database/migrations/YYYYMMDDHHMMSS-create-users-table.js
'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            role: {
                type: Sequelize.ENUM('client', 'admin', 'super_admin'),
                defaultValue: 'client'
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'banned'),
                defaultValue: 'active'
            },
            last_login: {
                type: Sequelize.DATE,
                allowNull: true
            },
            reset_password_token: {
                type: Sequelize.STRING,
                allowNull: true
            },
            reset_password_expires: {
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
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('users');
    }
};