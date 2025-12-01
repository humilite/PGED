import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

async function checkUserStatus() {
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

    // Vérifier le statut de l'utilisateur admin
    const result = await client.query(
      'SELECT id, email, first_name, last_name, role, is_active, last_login FROM users WHERE email = $1',
      [adminEmail]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(`👤 Utilisateur trouvé:`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Nom: ${user.first_name} ${user.last_name}`);
      console.log(`   - Rôle: ${user.role}`);
      console.log(`   - Actif: ${user.is_active}`);
      console.log(`   - Dernière connexion: ${user.last_login || 'Jamais'}`);

      if (!user.is_active) {
        console.log(`⚠️ Le compte n'est pas actif! Activation en cours...`);

        // Activer le compte
        await client.query('UPDATE users SET is_active = true WHERE email = $1', [adminEmail]);
        console.log(`✅ Compte activé pour ${adminEmail}`);
      } else {
        console.log(`✅ Le compte est actif`);
      }
    } else {
      console.log(`❌ Utilisateur ${adminEmail} non trouvé dans la base`);
    }

    await client.end();

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkUserStatus();
