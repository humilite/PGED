import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/authService';

const DocumentView = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await documentsAPI.getById(id);
      setDocument(response);
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
      a.download = document.title;
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

  const canPreview = (fileType) => {
    return fileType?.toLowerCase().includes('pdf') || fileType?.toLowerCase().includes('image');
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!document) return <div className="p-8 text-center">Document non trouvé</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
            <p className="text-gray-600 mt-2">{document.index_alphanum}</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Informations du document</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type de fichier</dt>
                    <dd className="text-sm text-gray-900">{document.file_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Taille</dt>
                    <dd className="text-sm text-gray-900">
                      {(document.file_size / 1024 / 1024).toFixed(2)} MB
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Niveau de confidentialité</dt>
                    <dd className="text-sm text-gray-900 capitalize">{document.confidentiality_level}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                    <dd className="text-sm text-gray-900 capitalize">{document.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date de création</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(document.created_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Télécharger
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                    Modifier
                  </button>
                  <button className="w-full px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-50">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
            
            {document.metadata && (
              <div className="mt-8">
                <h3 className="font-medium text-gray-900 mb-4">Métadonnées</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(document.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;