import React from 'react';
import { FileText, X, Download, Eye } from 'lucide-react';

const DocumentDetails = ({ document, onClose }) => {
  if (!document) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.toLowerCase().includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType?.toLowerCase().includes('image') || fileType?.toLowerCase().includes('jpg') || fileType?.toLowerCase().includes('png')) return <Eye className="h-8 w-8 text-green-500" />;
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  const canPreview = (fileType) => {
    return fileType?.toLowerCase().includes('pdf') || fileType?.toLowerCase().includes('image');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détails du document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            {getFileIcon(document.file_type)}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{document.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{document.index_alphanum}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type de fichier</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {document.file_type?.split('/')[1] || 'Inconnu'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Taille</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatFileSize(document.file_size)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Niveau de confidentialité</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {document.confidentiality_level}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {document.status || 'En attente'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Auteur</label>
                <p className="mt-1 text-sm text-gray-900">
                  {document.first_name} {document.last_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Classification</label>
                <p className="mt-1 text-sm text-gray-900">
                  {document.classification_name || 'Non classifié'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date de création</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(document.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {document.updated_at && document.updated_at !== document.created_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dernière modification</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(document.updated_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {document.description && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                {document.description}
              </p>
            </div>
          )}

          {document.metadata && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Métadonnées</label>
              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(document.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              // Handle download
              const link = document.createElement('a');
              link.href = `/api/documents/${document.id}/download`;
              link.download = document.file_name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetails;
