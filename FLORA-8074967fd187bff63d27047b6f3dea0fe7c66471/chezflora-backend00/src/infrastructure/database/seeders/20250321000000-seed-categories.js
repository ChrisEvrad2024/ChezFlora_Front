'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Créer d'abord les catégories parentes
        const parentCategories = [
            {
                id: uuidv4(),
                name: 'Plantes d\'intérieur',
                description: 'Plantes adaptées à la vie en intérieur',
                parent_id: null,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                name: 'Plantes d\'extérieur',
                description: 'Plantes adaptées aux jardins et espaces extérieurs',
                parent_id: null,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                name: 'Accessoires',
                description: 'Tous les accessoires pour vos plantes',
                parent_id: null,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        await queryInterface.bulkInsert('categories', parentCategories);

        // Récupérer les IDs des catégories parents pour créer des sous-catégories
        const categories = await queryInterface.sequelize.query(
            `SELECT id, name FROM categories`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const interiorPlantsId = categories.find(c => c.name === 'Plantes d\'intérieur').id;
        const exteriorPlantsId = categories.find(c => c.name === 'Plantes d\'extérieur').id;
        const accessoriesId = categories.find(c => c.name === 'Accessoires').id;

        // Créer les sous-catégories
        const subCategories = [
            // Sous-catégories pour plantes d'intérieur
            {
                id: uuidv4(),
                name: 'Plantes vertes',
                description: 'Plantes d\'intérieur à feuillage',
                parent_id: interiorPlantsId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                name: 'Plantes fleuries',
                description: 'Plantes d\'intérieur à fleurs',
                parent_id: interiorPlantsId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                name: 'Cactus et succulentes',
                description: 'Plantes grasses et cactus',
                parent_id: interiorPlantsId,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Sous-catégories pour plantes d'extérieur
            {
                id: uuidv4(),
                name: 'Arbustes',
                description: 'Arbustes pour jardins et terrasses',
                parent_id: exteriorPlantsId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                name: 'Fleurs de jardin',
                description: 'Plantes à fleurs pour l\'extérieur',
                parent_id: exteriorPlantsId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                name: 'Plantes aromatiques',
                description: 'Herbes et plantes aromatiques',
                parent_id: exteriorPlantsId,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Sous-catégories pour accessoires
            {
                id: uuidv4(),
                name: 'Pots et jardinières',
                description: 'Contenants pour plantes',
                parent_id: accessoriesId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                name: 'Outils',
                description: 'Outils de jardinage',
                parent_id: accessoriesId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                name: 'Terreaux et engrais',
                description: 'Substrats et nutriments pour plantes',
                parent_id: accessoriesId,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        await queryInterface.bulkInsert('categories', subCategories);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('categories', null, {});
    }
};