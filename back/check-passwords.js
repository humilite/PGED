import pool from './src/config/database.js';

async function checkPasswords() {
  try {
    const result = await pool.query('SELECT id, email, password FROM users');
    console.log('Utilisateurs dans la base de données:');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Password hash: ${user.password.substring(0, 20)}...`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

checkPasswords();
