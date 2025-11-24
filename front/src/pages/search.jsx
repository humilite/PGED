import React, { useState } from 'react';
import api from '../services/authService';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/documents/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching documents:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Recherche de documents</h1>
        
        {/* Formulaire de recherche */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un document..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </form>

        {/* Résultats */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Résultats de la recherche ({results.length})
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p className="text-gray-500">Recherche en cours...</p>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((document) => (
                  <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <h3 className="font-medium text-gray-900">{document.title}</h3>
                    <p className="text-sm text-gray-600">{document.index_alphanum}</p>
                    <p className="text-sm text-gray-500 mt-1">{document.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        Créé le {new Date(document.created_at).toLocaleDateString()}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Voir le document
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <p className="text-gray-500">Aucun document trouvé pour "{query}"</p>
            ) : (
              <p className="text-gray-500">Entrez un terme de recherche pour commencer</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;