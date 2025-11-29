import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testJWT() {
  console.log('🧪 Test des fonctionnalités JWT...\n');

  try {
    // Test 1: Connexion
    console.log('1️⃣ Test de connexion...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@dgrh.gov.ga',
      password: 'admin123'
    });

    const { token, user } = loginResponse.data;
    console.log('✅ Connexion réussie');
    console.log('👤 Utilisateur:', user.email);
    console.log('🔑 Token reçu:', token.substring(0, 20) + '...');

    // Test 2: Accès à une route protégée
    console.log('\n2️⃣ Test d\'accès à une route protégée...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Accès au profil réussi');

    // Test 3: Rafraîchissement du token
    console.log('\n3️⃣ Test de rafraîchissement du token...');
    const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const { token: newToken } = refreshResponse.data;
    console.log('✅ Token rafraîchi avec succès');
    console.log('🔄 Nouveau token:', newToken.substring(0, 20) + '...');

    // Test 4: Vérification que l'ancien token est toujours valide (devrait l'être)
    console.log('\n4️⃣ Test de validation de l\'ancien token...');
    const profileResponse2 = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Ancien token toujours valide');

    console.log('\n🎉 Tous les tests JWT sont passés avec succès!');
    console.log('🔧 Le problème "Token invalide ou expiré" devrait être résolu.');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('🚫 Erreur d\'authentification - le problème persiste');
    }
  }
}

testJWT();
