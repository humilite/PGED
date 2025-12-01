import pkg from 'pg';
const { Client } = pkg;
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function updateAdminPassword() {
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

    const adminEmail = 'admin@dgrh.gov.ga';
    const newPassword = 'admin123';

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    console.log(`🔐 Nouveau hash pour "${newPassword}": ${hashedPassword}`);

    // Mettre à jour le mot de passe
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, adminEmail]
    );

    if (result.rows.length > 0) {
      console.log(`✅ Mot de passe mis à jour pour ${adminEmail}`);
    } else {
      console.log(`❌ Utilisateur ${adminEmail} non trouvé`);
    }

    await client.end();
    console.log('🎉 Mise à jour terminée!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateAdminPassword();
