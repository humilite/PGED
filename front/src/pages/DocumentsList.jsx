import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Eye, Edit, Download, Search, Filter, User, Shield, Hash, Upload,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { documentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confidentialityFilter, setConfidentialityFilter] = useState('all');
  const { user } = useAuth();

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadDocuments();
  }, [currentPage, itemsPerPage]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsAPI.getAll({
        page: currentPage,
        limit: itemsPerPage
      });
      
      const enhancedDocuments = (data.documents || []).map(doc => {
        if (!doc.author && user && doc.user_id === user.id) {
          return {
            ...doc,
            author: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                    user.email?.split('@')[0] || 
                    user.username || 
                    'Utilisateur'
          };
        }
        return doc;
      });
      
      setDocuments(enhancedDocuments);
      setTotalItems(data.total || data.count || enhancedDocuments.length);
      setTotalPages(data.totalPages || Math.ceil((data.total || enhancedDocuments.length) / itemsPerPage));
    } catch (error) {
      console.error('Erreur chargement documents:', error);
      setDocuments([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.toLowerCase().includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType?.toLowerCase().includes('image') || fileType?.toLowerCase().includes('jpg') || fileType?.toLowerCase().includes('png')) return <FileText className="h-5 w-5 text-green-500" />;
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  const getConfidentialityLabel = (level) => {
    const levelMap = {
      'public': 'Public',
      'interne': 'Interne',
      'confidentiel': 'Confidentiel',
      'secret': 'Secret',
      'internal': 'Interne',
      'confidential': 'Confidentiel'
    };
    return levelMap[level?.toLowerCase()] || level || 'Non spécifié';
  };

  const getConfidentialityColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'public':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'interne':
      case 'internal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confidentiel':
      case 'confidential':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'secret':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAuthorDisplayName = (doc) => {
    if (doc.author && doc.author !== 'Non spécifié' && doc.author.trim() !== '') {
      return doc.author;
    }
    
    if (doc.first_name && doc.last_name) {
      return `${doc.first_name} ${doc.last_name}`;
    }
    
    if (doc.user_name) {
      return doc.user_name;
    }
    
    if (doc.user_email) {
      return doc.user_email.split('@')[0];
    }
    
    if (user && doc.user_id === user.id) {
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
    
    return 'Auteur non spécifié';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.index_alphanum?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getAuthorDisplayName(doc).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getConfidentialityLabel(doc.confidentiality_level).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesConfidentiality = confidentialityFilter === 'all' || 
                                  doc.confidentiality_level?.toLowerCase() === confidentialityFilter.toLowerCase();
    
    return matchesSearch && matchesConfidentiality;
  });

  const getUniqueConfidentialityLevels = () => {
    const levels = documents.map(doc => doc.confidentiality_level).filter(Boolean);
    return [...new Set(levels)];
  };

  // Fonctions de pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Retour à la première page
  };

  // Calcul des éléments affichés
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = endPage - maxVisiblePages + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton Upload */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Liste des documents
          </h1>
          <p className="text-gray-600">
            Gérez vos documents et consultez leur statut
          </p>
        </div>
        
        {/* Bouton Uploader un nouveau document */}
        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md self-start sm:self-center"
        >
          <Upload className="h-5 w-5" />
          <span>Uploader un nouveau document</span>
        </Link>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre, index, auteur ou niveau de confidentialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto">
            <div>
              <select
                value={confidentialityFilter}
                onChange={(e) => setConfidentialityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les niveaux</option>
                {getUniqueConfidentialityLevels().map((level) => (
                  <option key={level} value={level}>
                    {getConfidentialityLabel(level)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setConfidentialityFilter('all');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun document trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || confidentialityFilter !== 'all'
                ? 'Essayez de modifier vos critères de recherche.'
                : 'Commencez par uploader votre premier document.'}
            </p>
            {/* Bouton Upload visible aussi quand la liste est vide */}
            <Link
              to="/upload"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>Uploader votre premier document</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {/* COLONNE INDEX EN PREMIER */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Index
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau de confidentialité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taille
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => {
                    const authorName = getAuthorDisplayName(doc);
                    const confidentialityLevel = doc.confidentiality_level || 'interne';
                    const confidentialityLabel = getConfidentialityLabel(confidentialityLevel);
                    const confidentialityColor = getConfidentialityColor(confidentialityLevel);
                    
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        {/* Colonne Index - MAINTENANT EN PREMIER */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm font-mono text-gray-900 font-medium">
                              {doc.index_alphanum || 'Non généré'}
                            </div>
                          </div>
                        </td>
                        
                        {/* Colonne Document */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getFileIcon(doc.file_type)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {doc.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {doc.file_name || doc.original_filename}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Colonne Niveau de confidentialité */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 text-gray-400 mr-2" />
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${confidentialityColor}`}>
                              {confidentialityLabel}
                            </span>
                          </div>
                        </td>
                        
                        {/* Colonne Auteur */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {authorName}
                              </div>
                              {(doc.user_email || (user && doc.user_id === user.id && user.email)) && (
                                <div className="text-xs text-gray-500">
                                  {doc.user_email || (user && user.email)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {/* Colonne Taille */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(doc.file_size)}
                        </td>
                        
                        {/* Colonne Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </td>
                        
                        {/* Colonne Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/documents/${doc.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/documents/${doc.id}/edit`}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `/api/documents/${doc.id}/download`;
                                link.download = doc.file_name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              {/* Informations de pagination */}
              <div className="mb-4 sm:mb-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{startIndex}</span> à <span className="font-medium">{endIndex}</span> sur{' '}
                    <span className="font-medium">{totalItems}</span> documents
                  </span>
                  
                  {/* Sélecteur d'éléments par page */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Afficher :</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                    <span className="text-sm text-gray-700">par page</span>
                  </div>
                </div>
              </div>

              {/* Contrôles de pagination */}
              <div className="flex items-center space-x-2">
                {/* Première page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  title="Première page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>

                {/* Page précédente */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  title="Page précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Numéros de page */}
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${
                        currentPage === page
                          ? 'bg-green-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Page suivante */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  title="Page suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dernière page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  title="Dernière page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Statistiques et bouton Upload (optionnel en bas) */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {filteredDocuments.length > 0 && (
          <div className="text-sm text-gray-500">
            Page {currentPage} sur {totalPages} • {totalItems} document{totalItems > 1 ? 's' : ''} au total
          </div>
        )}
        
        {/* Bouton Upload supplémentaire en bas */}
        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md text-sm"
        >
          <Upload className="h-4 w-4" />
          <span>Ajouter un autre document</span>
        </Link>
      </div>

      {/* Légende des niveaux de confidentialité */}
      {filteredDocuments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-6 text-xs text-gray-500">
            <span className="font-medium">Légende :</span>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200 mr-1"></div>
              <span>Public</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200 mr-1"></div>
              <span>Interne</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200 mr-1"></div>
              <span>Confidentiel</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200 mr-1"></div>
              <span>Secret</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsList;