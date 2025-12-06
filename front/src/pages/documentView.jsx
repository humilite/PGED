import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { documentsAPI } from '../services/api';
import { FileText, Image, File, Download, Edit, Trash2, Eye, Calendar, Clock, Shield, Archive, User } from 'lucide-react';

const DocumentView = () => {
  const { id } = useParams();
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await documentsAPI.getById(id);
      
      if (Array.isArray(response) && response.length > 0) {
        setDocData(response[0]);
      } else if (response && typeof response === 'object') {
        if (response.document) {
          setDocData(response.document);
        } else {
          setDocData(response);
        }
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      setError('Document non trouvé');
      console.error('Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await documentsAPI.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docData?.title || docData?.file_name || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Erreur lors du téléchargement');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.toLowerCase().includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType?.toLowerCase().includes('image') || fileType?.toLowerCase().includes('jpg') || fileType?.toLowerCase().includes('png')) return <Image className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-blue-500" />;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch(statusLower) {
      case 'validé':
      case 'validated':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'en attente':
      case 'pending':
      case 'en cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejeté':
      case 'rejected':
      case 'refused':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour extraire les initiales de l'auteur
  const getAuthorInitials = () => {
    if (!docData) return '??';
    const firstName = docData.first_name || '';
    const lastName = docData.last_name || '';
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    return initials || '??';
  };

  // Fonction pour obtenir le nom complet de l'auteur
  const getAuthorFullName = () => {
    if (!docData) return 'Auteur inconnu';
    const firstName = docData.first_name || '';
    const lastName = docData.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Auteur inconnu';
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Fonction pour formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      const kb = bytes / 1024;
      return `${kb.toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  // Fonction pour obtenir le type de document
  const getDocumentType = () => {
    if (!docData?.file_type) return 'Non spécifié';
    const type = docData.file_type.toLowerCase();
    if (type.includes('pdf')) return 'Document PDF';
    if (type.includes('word') || type.includes('doc')) return 'Document Word';
    if (type.includes('excel') || type.includes('xls')) return 'Document Excel';
    if (type.includes('image')) return 'Image';
    return 'Document';
  };

  // Fonction pour traduire le statut (sans "Brouillon")
  const getTranslatedStatus = () => {
    if (!docData?.status) return 'Non spécifié';
    const status = docData.status.toLowerCase();
    if (status === 'validated' || status === 'approved') return 'Validé';
    if (status === 'pending') return 'En attente';
    if (status === 'rejected') return 'Rejeté';
    return docData.status; // On retourne le statut tel quel si ce n'est pas draft
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!docData) return <div className="p-8 text-center">Document non trouvé</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header avec titre et informations principales */}
          <div className="bg-linear-to-r from-blue-50 to-gray-50 p-6 border-b">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Aperçu du document</h1>
                <p className="text-gray-600 mt-1">{docData.title}</p>
              </div>

            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Colonne gauche - Informations */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 p-1 rounded">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </span>
                    Informations
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
  
                      <div>
                        <p className="text-sm font-medium text-gray-500">Type de document</p>
                        <p className="text-gray-900 mt-1">{getDocumentType()}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Catégorie</p>
                        <p className="text-gray-900 mt-1">
                          {docData.classification_name || 'Non catégorisé'}
                          {docData.classification_code && ` (${docData.classification_code})`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Auteur</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {getAuthorInitials()}
                            </span>
                          </div>
                          <span className="font-medium">{getAuthorFullName()}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Date de création
                        </p>
                        <p className="text-gray-900 mt-1">{formatDate(docData.created_at)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Dernière modification
                        </p>
                        <p className="text-gray-900 mt-1">{formatDate(docData.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Propriétés</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Taille</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {formatFileSize(docData.file_size)}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Version</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {docData.version || '1.0'}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-1">
                        <Shield className="h-4 w-4" />
                        Confidentialité
                      </p>
                      <p className="text-xl font-bold text-gray-900 mt-1 capitalize">
                        {docData.confidentiality_level || 'Standard'}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-1">
                        <Archive className="h-4 w-4" />
                        Index
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-1 font-mono">
                        {docData.index_alphanum || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Aperçu du document */}
                <div className="border-t pt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu du document</h2>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-4">
                      {getFileIcon(docData.file_type)}
                    </div>
                    <h3 className="text-center font-medium text-gray-900">{docData.title}</h3>
                    <p className="text-center text-gray-600 text-sm mt-2">
                      {getDocumentType()} • {formatFileSize(docData.file_size)}
                    </p>
                    <div className="mt-6 text-center">
                      <button 
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger pour visualiser
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Actions et métadonnées */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Action rapide</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      Télécharger le document
                    </button>
                    
                  </div>
                </div>

                {/* Métadonnées techniques */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Métadonnées techniques</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type de fichier</span>
                      <span className="text-gray-900">{docData.file_type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Taille réelle</span>
                      <span className="text-gray-900">
                        {docData.file_size ? `${docData.file_size} octets` : 'Non spécifié'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Nom original</span>
                      <span className="text-gray-900 truncate max-w-[200px]">
                        {docData.metadata?.originalName || docData.file_name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">ID du document</span>
                      <span className="text-gray-900 font-mono">{id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Index alphanumérique</span>
                      <span className="text-gray-900 font-mono">{docData.index_alphanum}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Code classification</span>
                      <span className="text-gray-900">{docData.classification_code}</span>
                    </div>
                  </div>
                </div>

                {/* Information de confidentialité */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Niveau de confidentialité</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Ce document est marqué comme "{docData.confidentiality_level || 'Standard'}". 
                        Assurez-vous de respecter les politiques de partage de votre organisation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;