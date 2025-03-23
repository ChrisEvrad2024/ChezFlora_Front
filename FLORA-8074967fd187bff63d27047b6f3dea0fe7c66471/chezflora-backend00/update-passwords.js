const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function updatePasswords() {
    // Connexion à la base de données
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'chezflora'
    });

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash('00000000', 10);

    // Mettre à jour les mots de passe
    await connection.execute(
        'UPDATE users SET password = ? WHERE email IN (?, ?)',
        [hashedPassword, 'omgba@gmail.com', 'omgbaa@gmail.com']
    );

    console.log('Mots de passe mis à jour avec succès!');
    await connection.end();
}

updatePasswords().catch(console.error);