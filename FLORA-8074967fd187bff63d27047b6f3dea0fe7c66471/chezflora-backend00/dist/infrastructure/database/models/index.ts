// // src/infrastructure/database/models/index.ts
// // Exporter tous les modèles de manière centralisée
// import { Sequelize } from 'sequelize-typescript';
// import  User  from './user.model';
// import { Address } from './address.model';
// // Importez ici tous vos autres modèles

// // Exporter tous les modèles
// export { User, Address };

// // Fonction pour initialiser les modèles
// export function initModels(sequelize: Sequelize): void {
//     sequelize.addModels([User, Address]);

//     // Définir les associations manuellement si nécessaire après l'initialisation
//     User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
//     Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// }