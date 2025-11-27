import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, File, X, FolderOpen } from 'lucide-react';
import api from '../services/authService';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [classifications, setClassifications] = useState([]);
  const [formData, setFormData] = useState({
    classification_id: '',
    confidentiality_level: 'interne',
    description: ''
  });
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchClassifications();
  }, []);

  const fetchClassifications = async () => {
    try {
      const response = await documentsAPI.getClassifications();
      setClassifications(response.classifications || []);
    } catch (error) {
      console.error('Error fetching classifications:', error);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      alert('Veuillez sélectionner au moins un fichier');
      return;
    }

    if (!formData.classification_id) {
      alert('Veuillez sélectionner une classification');
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('title', file.name);
        uploadFormData.append('classification_id', formData.classification_id);
        uploadFormData.append('confidentiality_level', formData.confidentiality_level);
        uploadFormData.append('description', formData.description);

        await api.post('/documents/upload', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      alert('Documents uploadés avec succès!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nouveau document</h1>
              <p className="text-gray-600">Déposez et archivez vos documents</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Zone de dépôt */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sélection des fichiers
                </h3>

                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
                >
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  
                  <p className="text-gray-600 mb-2">
                    Glissez-déposez vos fichiers ici ou
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Parcourir les fichiers
                  </button>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Formats supportés: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                  </p>
                  <p className="text-sm text-gray-500">
                    Taille maximale: 50 MB par fichier
                  </p>
                </div>

                {/* Liste des fichiers sélectionnés */}
                {files.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Fichiers sélectionnés ({files.length})
                    </h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Métadonnées */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Métadonnées du document
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Classification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan de classement *
                    </label>
                    <select
                      required
                      value={formData.classification_id}
                      onChange={(e) => setFormData({...formData, classification_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionnez une classification</option>
                      {classifications.map((classification) => (
                        <option key={classification.id} value={classification.id}>
                          {classification.code} - {classification.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Niveau de confidentialité */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau de confidentialité
                    </label>
                    <select
                      value={formData.confidentiality_level}
                      onChange={(e) => setFormData({...formData, confidentiality_level: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="interne">Interne</option>
                      <option value="confidentiel">Confidentiel</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Description du document..."
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || files.length === 0}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-5 w-5" />
                      Archiver les documents
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;