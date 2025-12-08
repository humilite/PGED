import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  Filter,
  FileText,
  User,
  Calendar,
  Hash,
  Download,
  Eye,
  ChevronDown,
  X,
  Clock,
  Shield,
  Tag,
  FolderOpen,
  Check,
  RefreshCw,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import api from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Search = () => {
  const [query, setQuery] = useState('');
  const [allDocuments, setAllDocuments] = useState([]); // Tous les documents retournés par l'API
  const [documents, setDocuments] = useState([]); // Documents filtrés côté frontend
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    confidentiality: [],
    document_type: [],
    dateRange: { start: '', end: '' },
    author: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Options de filtres
  const confidentialityOptions = [
    { value: 'public', label: 'Public', color: 'green' },
    { value: 'interne', label: 'Interne', color: 'blue' },
    { value: 'confidentiel', label: 'Confidentiel', color: 'yellow' },
    { value: 'secret', label: 'Secret', color: 'red' }
  ];
  
  const documentTypeOptions = [
    { value: 'contrat', label: 'Contrat', icon: '📄' },
    { value: 'rapport', label: 'Rapport', icon: '📊' },
    { value: 'dossier', label: 'Dossier', icon: '📁' },
    { value: 'correspondance', label: 'Correspondance', icon: '✉️' },
    { value: 'budget', label: 'Budget', icon: '💰' }
  ];

  // Charger les recherches récentes
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Filtrage côté client quand les filtres ou les documents changent
  useEffect(() => {
    if (allDocuments.length > 0) {
      applyFrontendFilters();
    }
  }, [filters, allDocuments]);

  // Fonction pour appliquer les filtres côté frontend
  const applyFrontendFilters = () => {
    if (allDocuments.length === 0) return;

    let filtered = [...allDocuments];

    // Filtre par confidentialité
    if (filters.confidentiality.length > 0) {
      filtered = filtered.filter(doc => {
        if (!doc.confidentiality_level) return false;
        const docConfidentiality = doc.confidentiality_level.toLowerCase();
        return filters.confidentiality.some(filterConfidentiality => 
          docConfidentiality.includes(filterConfidentiality.toLowerCase())
        );
      });
    }

    // Filtre par type de document
    if (filters.document_type.length > 0) {
      filtered = filtered.filter(doc => {
        const docType = (doc.document_type || doc.file_type || '').toLowerCase();
        return filters.document_type.some(filterType => 
          docType.includes(filterType.toLowerCase())
        );
      });
    }

    // Filtre par auteur
    if (filters.author.trim()) {
      const authorFilter = filters.author.toLowerCase().trim();
      filtered = filtered.filter(doc => {
        const authorName = getAuthorName(doc).toLowerCase();
        return authorName.includes(authorFilter);
      });
    }

    // Filtre par date
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(doc => {
        if (!doc.created_at) return false;
        
        const docDate = new Date(doc.created_at);
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (docDate < startDate) return false;
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (docDate > endDate) return false;
        }
        
        return true;
      });
    }

    setDocuments(filtered);
  };

  // Fonction pour obtenir le nom de l'auteur
  const getAuthorName = (document) => {
    // Priorité 1: Champ author direct
    if (document.author && document.author.trim() !== '') {
      return document.author;
    }
    
    // Priorité 2: Informations utilisateur dans le document
    if (document.first_name && document.last_name) {
      return `${document.first_name} ${document.last_name}`;
    }
    
    // Priorité 3: User name
    if (document.user_name) {
      return document.user_name;
    }
    
    // Priorité 4: Email utilisateur
    if (document.user_email) {
      return document.user_email.split('@')[0];
    }
    
    // Priorité 5: Utilisateur connecté si c'est son document
    if (user && document.user_id === user.id) {
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      }
      if (user.name) {
        return user.name;
      }
      if (user.email) {
        return user.email.split('@')[0];
      }
    }
    
    return 'Auteur inconnu';
  };

  // Sauvegarder une recherche
  const saveSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const updatedSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    console.log('🔍 Début de la recherche');
    console.log('📝 Query:', query);
    console.log('⚙️ Filters:', filters);
    
    // Vérifier s'il y a au moins un critère de recherche
    const hasSearchCriteria = query.trim() || 
      filters.confidentiality.length > 0 || 
      filters.document_type.length > 0 || 
      filters.author.trim() || 
      filters.dateRange.start || 
      filters.dateRange.end;
    
    if (!hasSearchCriteria) {
      setError('Veuillez entrer un terme de recherche ou sélectionner un filtre');
      return;
    }
    
    setLoading(true);
    setSearchPerformed(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (query.trim()) {
        params.append('q', query.trim());
        saveSearch(query.trim());
      }
      
      // Note: On envoie toujours les filtres au backend, même si on filtre aussi côté frontend
      if (filters.confidentiality.length > 0) {
        params.append('confidentiality', filters.confidentiality.join(','));
      }
      
      if (filters.document_type.length > 0) {
        params.append('document_type', filters.document_type.join(','));
      }
      
      if (filters.author.trim()) {
        params.append('author', filters.author.trim());
      }
      
      if (filters.dateRange.start) {
        params.append('start_date', filters.dateRange.start);
      }
      
      if (filters.dateRange.end) {
        params.append('end_date', filters.dateRange.end);
      }
      
      const url = `/documents/search?${params.toString()}`;
      console.log('📡 URL de recherche:', url);
      
      const response = await api.get(url);
      console.log('✅ Réponse de l\'API:', response.data);
      
      // Normaliser les données
      let documentsData = [];
      if (response.data && Array.isArray(response.data)) {
        documentsData = response.data;
      } else if (response.data && response.data.documents) {
        documentsData = response.data.documents;
      }
      
      // Ajouter les informations d'auteur manquantes
      const enhancedDocuments = documentsData.map(doc => ({
        ...doc,
        author: getAuthorName(doc)
      }));
      
      setAllDocuments(enhancedDocuments);
      
      // Appliquer le filtrage côté frontend
      const filteredDocuments = enhancedDocuments.filter(doc => {
        // Si aucun filtre de confidentialité n'est sélectionné, on garde tous les documents
        if (filters.confidentiality.length === 0) return true;
        
        // Vérifier la confidentialité
        if (!doc.confidentiality_level) return false;
        
        const docConfidentiality = doc.confidentiality_level.toLowerCase();
        return filters.confidentiality.some(filterConfidentiality => 
          docConfidentiality.includes(filterConfidentiality.toLowerCase())
        );
      });
      
      setDocuments(filteredDocuments);
      
      console.log('📊 Documents après filtrage frontend:', filteredDocuments.length);
      
    } catch (error) {
      console.error('❌ Erreur de recherche:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          navigate('/login');
          return;
        } else if (error.response.status === 404) {
          setError('Endpoint de recherche introuvable. Vérifiez la configuration du backend.');
        } else {
          setError(`Erreur serveur: ${error.response.status}`);
        }
      } else if (error.request) {
        setError('Le serveur ne répond pas. Vérifiez que le backend est démarré.');
      } else {
        setError(`Erreur: ${error.message}`);
      }
      
      setAllDocuments([]);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'confidentiality' || filterType === 'document_type') {
        const currentValues = prev[filterType];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterType]: newValues };
      }
      
      if (filterType === 'dateRange') {
        return { ...prev, dateRange: value };
      }
      
      return { ...prev, [filterType]: value };
    });
  };

  const clearFilters = () => {
    setFilters({
      confidentiality: [],
      document_type: [],
      dateRange: { start: '', end: '' },
      author: ''
    });
    setQuery('');
    setAllDocuments([]);
    setDocuments([]);
    setSearchPerformed(false);
    setError(null);
  };

  const handleQuickSearch = (searchTerm) => {
    setQuery(searchTerm);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getConfidentialityBadge = (level) => {
    // Normaliser le niveau de confidentialité pour la comparaison
    const normalizedLevel = level?.toLowerCase() || '';
    const option = confidentialityOptions.find(opt => 
      opt.value === normalizedLevel || 
      opt.label.toLowerCase() === normalizedLevel
    ) || { label: level || 'Non spécifié', color: 'gray' };
    
    const colorClasses = {
      green: 'bg-green-50 text-green-700 border border-green-200',
      blue: 'bg-blue-50 text-blue-700 border border-blue-200',
      yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      red: 'bg-red-50 text-red-700 border border-red-200',
      gray: 'bg-gray-50 text-gray-700 border border-gray-200'
    };
    
    return (
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[option.color]}`}>
        <Shield className="h-3 w-3" />
        {option.label}
      </div>
    );
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = () => {
    return filters.confidentiality.length > 0 || 
           filters.document_type.length > 0 || 
           filters.author.trim() || 
           filters.dateRange.start || 
           filters.dateRange.end;
  };

  // Rendu responsive des résultats
  const renderDocumentCard = (document, index) => (
    <div
      key={document.id || index}
      className="bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        {/* En-tête du document */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <div className="hidden sm:block">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                  {document.title || 'Document sans titre'}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {document.index_alphanum && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Hash className="h-3.5 w-3.5" />
                      <span className="font-mono font-medium">{document.index_alphanum}</span>
                    </div>
                  )}
                  {document.confidentiality_level && (
                    <div className="hidden sm:block">
                      {getConfidentialityBadge(document.confidentiality_level)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Badge de confidentialité sur mobile */}
            {document.confidentiality_level && (
              <div className="sm:hidden mb-3">
                {getConfidentialityBadge(document.confidentiality_level)}
              </div>
            )}
            
            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {document.description || 'Aucune description disponible'}
            </p>
          </div>
          
          {/* Actions sur desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to={`/documents/${document.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
              title="Voir les détails"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden lg:inline">Voir</span>
            </Link>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = `/api/documents/${document.id}/download`;
                link.download = document.file_name || 'document';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Métadonnées */}
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <User className="h-3.5 w-3.5" />
                <span>Auteur</span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {getAuthorName(document)}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Date</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(document.created_at)}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <FolderOpen className="h-3.5 w-3.5" />
                <span>Taille</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatFileSize(document.file_size)}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Tag className="h-3.5 w-3.5" />
                <span>Type</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {document.document_type || document.file_type || 'Document'}
              </p>
            </div>
          </div>
          
          {/* Actions sur mobile */}
          <div className="sm:hidden flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Link
                to={`/documents/${document.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
              >
                <Eye className="h-4 w-4" />
                Voir
              </Link>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `/api/documents/${document.id}/download`;
                  link.download = document.file_name || 'document';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </button>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Mots-clés */}
        {document.keywords && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {document.keywords.split(',').slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
              >
                {keyword.trim()}
              </span>
            ))}
            {document.keywords.split(',').length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-medium">
                +{document.keywords.split(',').length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Recherche de documents
                </h1>
                <p className="text-gray-600 text-sm">
                  Recherchez et filtrez vos documents archivés
                </p>
              </div>
              
              {/* Bouton retour */}
              <Link
                to="/documents"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 self-start sm:self-center"
              >
                ← Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par titre, index, mots-clés..."
                className="w-full pl-12 pr-32 sm:pr-36 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {hasActiveFilters() && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium transition-all disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Recherche...</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Rechercher</span>
                      <span className="sm:hidden">Rechercher</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Bouton filtres mobile */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 mt-3 px-4 py-2.5 w-full justify-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filtres {hasActiveFilters() && '•'}
              {hasActiveFilters() && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>
            
            {/* Suggestions de recherche récentes */}
            {recentSearches.length > 0 && !query && !showFilters && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 animate-fade-in">
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Recherches récentes</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((searchTerm, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuickSearch(searchTerm)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                      >
                        <Clock className="h-3 w-3" />
                        {searchTerm}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
          
          {/* Indicateur de critères actifs */}
          {(query || hasActiveFilters()) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Critères :</span>
              {query && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <SearchIcon className="h-3 w-3" />
                  "{query}"
                </span>
              )}
              {filters.confidentiality.map(level => {
                const option = confidentialityOptions.find(opt => opt.value === level);
                return option && (
                  <span key={level} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    <Shield className="h-3 w-3" />
                    {option.label}
                  </span>
                );
              })}
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 text-sm"
              >
                <X className="h-3 w-3" />
                Effacer
              </button>
            </div>
          )}
        </div>

        {/* Panneau des filtres responsive */}
        {showFilters && (
          <div className="mb-8 bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filtres avancés</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Réinitialiser</span>
                  <span className="sm:hidden">Effacer</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Filtre par niveau de confidentialité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Niveau de confidentialité
                </label>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {confidentialityOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.confidentiality.includes(option.value)}
                          onChange={() => handleFilterChange('confidentiality', option.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                          filters.confidentiality.includes(option.value)
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          {filters.confidentiality.includes(option.value) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Filtre par auteur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Auteur
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.author}
                      onChange={(e) => handleFilterChange('author', e.target.value)}
                      placeholder="Nom de l'auteur..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>
                
                {/* Filtre par date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Période
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => handleFilterChange('dateRange', { 
                          ...filters.dateRange, 
                          start: e.target.value 
                        })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder="Début"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => handleFilterChange('dateRange', { 
                          ...filters.dateRange, 
                          end: e.target.value 
                        })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        placeholder="Fin"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Boutons d'action des filtres */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 sm:px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Fermer
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 sm:px-5 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-medium disabled:opacity-50 text-sm"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}

        {/* Résultats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {searchPerformed ? (
                  <>
                    {documents.length} document{documents.length !== 1 ? 's' : ''} trouvé{documents.length !== 1 ? 's' : ''}
                    {allDocuments.length > documents.length && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (filtré sur {allDocuments.length} résultat{allDocuments.length !== 1 ? 's' : ''} totaux)
                      </span>
                    )}
                  </>
                ) : (
                  'Recherchez vos documents'
                )}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {searchPerformed
                  ? 'Affichage des résultats de votre recherche'
                  : 'Utilisez la barre de recherche pour commencer'}
              </p>
            </div>
            
            {documents.length > 0 && (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => {
                    console.log('Export des documents');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  Exporter
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4 sm:mb-6"></div>
              <p className="text-base sm:text-lg font-medium text-gray-700">Recherche en cours...</p>
              <p className="text-gray-500 text-sm sm:text-base mt-2">Veuillez patienter</p>
            </div>
          ) : searchPerformed && documents.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gray-100 flex items-center justify-center">
                <SearchIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
                {query 
                  ? `Aucun document ne correspond à votre recherche "${query}".`
                  : 'Aucun document ne correspond à vos critères de filtrage.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setQuery('');
                    handleSearch();
                  }}
                  className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all text-sm sm:text-base"
                >
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                  Voir tous les documents
                </button>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:bg-gray-200 transition-all text-sm sm:text-base"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  Réinitialiser
                </button>
              </div>
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {documents.map((document, index) => renderDocumentCard(document, index))}
            </div>
          ) : (
            /* État initial - suggestions */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  title: 'Recherche par titre',
                  description: 'Trouvez rapidement vos documents en saisissant leur titre ou des mots-clés.',
                  icon: FileText,
                  color: 'blue'
                },
                {
                  title: 'Utilisez les filtres',
                  description: 'Affinez vos résultats avec nos filtres avancés par type, date et confidentialité.',
                  icon: Filter,
                  color: 'green'
                },
                {
                  title: 'Index alphanumérique',
                  description: 'Recherchez directement avec le code index unique de chaque document.',
                  icon: Hash,
                  color: 'purple'
                }
              ].map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-${suggestion.color}-100 flex items-center justify-center mb-3 sm:mb-4`}>
                    <suggestion.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${suggestion.color}-600`} />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">{suggestion.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{suggestion.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;