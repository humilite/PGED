import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          console.log('🔄 Tentative de rafraîchissement du token au chargement');
          const response = await axios.post('http://localhost:5000/api/auth/refresh', {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ Token rafraîchi avec succès');
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        } catch (error) {
          console.warn('❌ Échec du rafraîchissement du token, suppression des données locales');
          console.error('Erreur:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Tentative de connexion avec:', email);

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Réponse du serveur - Status:', response.status, response.statusText);
      console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        data = await response.json();
        console.log('📦 Données reçues:', data);
      } catch (parseError) {
        console.error('❌ Erreur de parsing JSON:', parseError);
        return { success: false, error: `Erreur de réponse du serveur: ${response.statusText}` };
      }

      if (response.ok && data.token) {
        console.log('✅ Connexion réussie pour:', data.user.email);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        console.warn('❌ Échec de connexion - Status:', response.status, '- Erreur:', data.error);
        const errorMessage = data.error || `Erreur ${response.status}: ${response.statusText}`;
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('💥 Erreur réseau lors de la connexion:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: 'Impossible de contacter le serveur. Vérifiez que le backend est démarré sur localhost:5000' };
      }
      return { success: false, error: `Erreur de réseau: ${error.message}` };
    }
  }; // ← ACCOLADE FERMANTE MANQUANTE AJOUTÉE ICI

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};