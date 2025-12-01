import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

async function insertTestUsers() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ged_bd',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Admin',
  });

  try {
    await client.connect();
    console.log('🔗 Connecté à la base de données');

    const testUsers = [
      { email: 'admin@dgrh.gov.ga', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', first_name: 'Admin', last_name: 'System', role: 'admin' },
      { email: 'user@dgrh.gov.ga', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', first_name: 'User', last_name: 'Test', role: 'user' },
      { email: 'gestionnaire@dgrh.gov.ga', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', first_name: 'Gestionnaire', last_name: 'Test', role: 'gestionnaire' }
    ];

    for (const user of testUsers) {
      // Vérifier si l'utilisateur existe
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)',
          [user.email, user.password, user.first_name, user.last_name, user.role]
        );
        console.log(`✅ Utilisateur ${user.email} créé`);
      } else {
        console.log(`⚠️ Utilisateur ${user.email} existe déjà`);
      }
    }

    // Lister tous les utilisateurs
    const users = await client.query('SELECT id, email, first_name, last_name, role FROM users');
    console.log('👥 Utilisateurs dans la base de données:');
    users.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`);
    });

    await client.end();
    console.log('🎉 Insertion terminée!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

insertTestUsers();
