const bcrypt = require('bcryptjs');

async function generateHashes() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);
  const gestHash = await bcrypt.hash('gest123', 10);

  console.log('Admin hash:', adminHash);
  console.log('User hash:', userHash);
  console.log('Gestionnaire hash:', gestHash);
}

generateHashes();
