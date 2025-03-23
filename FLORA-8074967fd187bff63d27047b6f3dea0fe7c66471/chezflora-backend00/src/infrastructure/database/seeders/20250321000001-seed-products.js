'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Récupérer les IDs des catégories pour associer les produits
        const categories = await queryInterface.sequelize.query(
            `SELECT id, name FROM categories`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const getCategoryIdByName = (name) => {
            const category = categories.find(c => c.name === name);
            return category ? category.id : null;
        };

        // Obtenir les IDs des catégories
        const plantesVertesId = getCategoryIdByName('Plantes vertes');
        const plantesFleuresId = getCategoryIdByName('Plantes fleuries');
        const cactusId = getCategoryIdByName('Cactus et succulentes');
        const arbustesId = getCategoryIdByName('Arbustes');
        const fleursJardinId = getCategoryIdByName('Fleurs de jardin');
        const aromatiquesId = getCategoryIdByName('Plantes aromatiques');
        const potsId = getCategoryIdByName('Pots et jardinières');
        const outilsId = getCategoryIdByName('Outils');
        const terreauxId = getCategoryIdByName('Terreaux et engrais');

        // Créer les produits
        const products = [
            // Plantes vertes
            {
                id: uuidv4(),
                category_id: plantesVertesId,
                name: 'Monstera Deliciosa',
                description: 'Plante tropicale à grandes feuilles perforées, facile d\'entretien et très décorative.',
                price: 29.99,
                stock: 15,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: plantesVertesId,
                name: 'Ficus Lyrata',
                description: 'Plante d\'intérieur élégante avec de grandes feuilles en forme de violon.',
                price: 39.99,
                stock: 8,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: plantesVertesId,
                name: 'Pothos Doré',
                description: 'Plante retombante à feuilles vertes marbrées de jaune, idéale pour les débutants.',
                price: 15.99,
                stock: 25,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Plantes fleuries
            {
                id: uuidv4(),
                category_id: plantesFleuresId,
                name: 'Orchidée Phalaenopsis',
                description: 'Élégante orchidée aux fleurs délicates et durables.',
                price: 24.99,
                stock: 12,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: plantesFleuresId,
                name: 'Anthurium Rouge',
                description: 'Plante à fleurs rouges brillantes en forme de cœur.',
                price: 22.50,
                stock: 10,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Cactus et succulentes
            {
                id: uuidv4(),
                category_id: cactusId,
                name: 'Assortiment de Mini Cactus',
                description: 'Ensemble de 3 petits cactus variés dans des pots décoratifs.',
                price: 18.99,
                stock: 20,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: cactusId,
                name: 'Echeveria Elegans',
                description: 'Succulente en forme de rosette aux feuilles bleu-gris.',
                price: 12.50,
                stock: 15,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Arbustes
            {
                id: uuidv4(),
                category_id: arbustesId,
                name: 'Hortensia Bleu',
                description: 'Arbuste à fleurs bleues abondantes, parfait pour les coins ombragés du jardin.',
                price: 27.99,
                stock: 8,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: arbustesId,
                name: 'Rosier Grimpant',
                description: 'Rosier aux fleurs rouges parfumées, idéal pour les treillis et pergolas.',
                price: 34.99,
                stock: 6,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Fleurs de jardin
            {
                id: uuidv4(),
                category_id: fleursJardinId,
                name: 'Tulipes Mélangées',
                description: 'Lot de 20 bulbes de tulipes aux couleurs variées.',
                price: 14.99,
                stock: 30,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: fleursJardinId,
                name: 'Pétunias Multicolores',
                description: 'Pack de 6 plants de pétunias aux couleurs vives.',
                price: 12.99,
                stock: 25,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Plantes aromatiques
            {
                id: uuidv4(),
                category_id: aromatiquesId,
                name: 'Basilic Genovese',
                description: 'Plant de basilic à grandes feuilles, parfumé et idéal pour la cuisine.',
                price: 5.99,
                stock: 40,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: aromatiquesId,
                name: 'Trio d\'Aromatiques',
                description: 'Ensemble comprenant un plant de thym, de romarin et de menthe.',
                price: 15.99,
                stock: 18,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Pots et jardinières
            {
                id: uuidv4(),
                category_id: potsId,
                name: 'Pot en Céramique Blanc',
                description: 'Pot élégant en céramique blanche, diamètre 15 cm.',
                price: 19.99,
                stock: 22,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: potsId,
                name: 'Jardinière Suspendue',
                description: 'Jardinière en macramé avec pot en céramique, idéale pour les plantes retombantes.',
                price: 24.99,
                stock: 15,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Outils
            {
                id: uuidv4(),
                category_id: outilsId,
                name: 'Set d\'Outils de Jardin',
                description: 'Ensemble de 3 outils essentiels : pelle, fourche et transplantoir.',
                price: 29.99,
                stock: 10,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: outilsId,
                name: 'Sécateur Professionnel',
                description: 'Sécateur de qualité pour la taille des plantes et arbustes.',
                price: 15.99,
                stock: 12,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },

            // Terreaux et engrais
            {
                id: uuidv4(),
                category_id: terreauxId,
                name: 'Terreau Universel 10L',
                description: 'Terreau de qualité pour tous types de plantes d\'intérieur et d\'extérieur.',
                price: 9.99,
                stock: 35,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                category_id: terreauxId,
                name: 'Engrais Plantes Vertes',
                description: 'Engrais liquide concentré pour stimuler la croissance des plantes vertes.',
                price: 7.99,
                stock: 28,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        await queryInterface.bulkInsert('products', products);

        // Créer quelques images pour les produits
        const productIds = await queryInterface.sequelize.query(
            `SELECT id, name FROM products`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const productImages = [];

        // Pour chaque produit, ajouter une image fictive
        productIds.forEach((product, index) => {
            productImages.push({
                id: uuidv4(),
                product_id: product.id,
                url: `https://example.com/images/products/${index + 1}.jpg`,
                order: 0,
                created_at: new Date(),
                updated_at: new Date()
            });
        });

        await queryInterface.bulkInsert('product_images', productImages);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('product_images', null, {});
        await queryInterface.bulkDelete('products', null, {});
    }
};