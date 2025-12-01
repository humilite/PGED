const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

async function updatePasswords() {
  try {
    console.log('🔄 Mise à jour des mots de passe...');

    // Mot de passe par défaut pour tous les utilisateurs
    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    console.log('Nouveau hash généré:', hashedPassword);

    // Mettre à jour tous les utilisateurs avec le nouveau mot de passe
    const query = 'UPDATE users SET password = $1';
    await pool.query(query, [hashedPassword]);

    console.log('✅ Tous les mots de passe ont été mis à jour vers "password"');

    // Afficher les utilisateurs mis à jour
    const result = await pool.query('SELECT id, email, first_name, last_name FROM users');
    console.log('Utilisateurs dans la base de données:');
    result.rows.forEach(user => {
      console.log(`- ${user.email}: ${user.first_name} ${user.last_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des mots de passe:', error);
    process.exit(1);
  }
}

updatePasswords();
