import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-12 sm:px-6 lg:px-8 bg-linear-to-br from-green-800 via-green-700 to-green-600">
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo de la présidence */}
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <img 
                src="/logo.png" 
                alt="Logo de la Présidence de la République Gabonaise"
                className="h-16 w-16 object-contain"
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />

            </div>
          </div>

          {/* En-tête avec le titre principal */}
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-3">
              Présidence de la République
            </h1>
            <h2 className="text-lg font-semibold mb-2">
              Plateforme d'archivage numérique de Documents
            </h2>
            <p className="text-sm mb-6">
              Direction Générale des Ressources Humaines
            </p>
          </div>

          {/* Ligne de séparation */}
          <div className="border-t border-white border-opacity-40 my-6"></div>

          {/* Sous-titre */}
          <div className="text-center mb-8 text-white">
            <h3 className="text-xl font-medium mb-2">
              Connexion sécurisée
            </h3>
            <p className="text-sm">
              Accédez à vos archives professionnelles
            </p>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-2xl sm:rounded-lg border border-gray-200">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
              
              {/* Champ Identifiant */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Identifiant
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="Votre identifiant"
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="Votre mot de passe"
                  />
                </div>
              </div>

              {/* Bouton de connexion */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-200"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </div>
            </form>

            {/* Message de sécurité en bas du formulaire */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-600 mb-2">
                Système sécurisé - Accès réservé au personnel autorisé
              </p>
              <p className="text-xs text-gray-600 mb-4">
                Pour toute assistance : support.archives@dgrh.gov.ga
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright en bas de page */}
      <div className="text-center mt-5">
        <p className="text-xs text-white text-opacity-80">
          © 2025 Présidence de la République Gabonaise - DGRH
        </p>
      </div>
    </div>
  );
};

export default Login;