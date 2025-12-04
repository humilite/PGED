import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  File, 
  X, 
  FolderOpen,
  Calendar,
  User,
  Hash,
  FileText,
  Tag,
  Clock,
  Info,
  Layers,
  ChevronRight,
  Save,
  Shield,
  Archive
} from 'lucide-react';
import api from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Upload = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [classifications, setClassifications] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);
  const [generatedIndex, setGeneratedIndex] = useState('');
  const [sequentialNumber, setSequentialNumber] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: '',
    confidentiality_level: 'interne',
    keywords: '',
    retention_period: '',
    classification_id: '',
    classification_path: []
  });
  
  const [metadata, setMetadata] = useState({
    fileName: '',
    creationDate: '',
    fileSize: '',
    author: ''
  });
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchClassifications();
    // Charger le dernier numéro séquentiel depuis l'API ou localStorage
    loadSequentialNumber();
  }, []);

  useEffect(() => {
    if (file) {
      // Métadonnées automatiques
      const fileName = file.name;
      const fileSize = formatFileSize(file.size);
      const creationDate = new Date().toLocaleDateString('fr-FR');
      
      // ÉTAPE 2 AMÉLIORÉE : Auteur sous forme Nom Prénom
      let author = 'Utilisateur';
      if (user) {
        // Format: Nom Prénom (si disponible)
        if (user.last_name && user.first_name) {
          author = `${user.last_name} ${user.first_name}`;
        } else if (user.name) {
          author = user.name;
        } else if (user.email) {
          author = user.email.split('@')[0];
        }
      }
      
      setMetadata({
        fileName,
        creationDate,
        fileSize,
        author
      });
      
      // Mettre le nom du fichier comme titre par défaut
      setFormData(prev => ({
        ...prev,
        title: fileName.replace(/\.[^/.]+$/, "") // Enlever l'extension
      }));
    }
  }, [file, user]);

  useEffect(() => {
    if (selectedPath.length > 0) {
      generateIndex();
    }
  }, [selectedPath, sequentialNumber]);

  const loadSequentialNumber = async () => {
    try {
      // Récupérer le dernier numéro séquentiel utilisé
      const response = await api.get('/documents/last-sequence');
      if (response.data && response.data.lastSequence) {
        setSequentialNumber(response.data.lastSequence + 1);
      }
    } catch (error) {
      console.error('Error loading sequence number:', error);
      // Commencer à 1 par défaut
      setSequentialNumber(1);
    }
  };

  const fetchClassifications = async () => {
    try {
      const response = await api.get('/classifications');
      setClassifications(response.data || []);
    } catch (error) {
      console.error('Error fetching classifications:', error);
    }
  };

  const findClassificationPath = (classifications, targetId, path = []) => {
    for (const classification of classifications) {
      const newPath = [...path, classification];
      
      if (classification.id == targetId) {
        return newPath;
      }
      
      if (classification.children && classification.children.length > 0) {
        const childPath = findClassificationPath(classification.children, targetId, newPath);
        if (childPath) return childPath;
      }
    }
    return null;
  };

  const handleClassificationSelect = (e) => {
    const classificationId = e.target.value;
    
    if (classificationId) {
      const path = findClassificationPath(classifications, classificationId);
      
      if (path) {
        setSelectedPath(path);
        setFormData(prev => ({
          ...prev,
          classification_id: classificationId,
          classification_path: path.map(item => ({ 
            id: item.id, 
            code: item.code,
            name: item.name 
          }))
        }));
        
        // Incrémenter le numéro séquentiel pour le prochain document
        setSequentialNumber(prev => prev + 1);
      }
    } else {
      setSelectedPath([]);
      setFormData(prev => ({
        ...prev,
        classification_id: '',
        classification_path: []
      }));
      setGeneratedIndex('');
    }
  };

  const generateIndex = () => {
    const year = new Date().getFullYear();
    
    if (selectedPath.length > 0) {
      // ÉTAPE 3 AMÉLIORÉE : Créer l'index avec tous les codes du chemin + numéro séquentiel
      const codes = selectedPath.map(item => item.code || 'CODE').join('-');
      // Format: [code-niveau1]-[code-niveau2]-...-[Année]-[NuméroSéquentiel]
      const index = `${codes}-${year}-${sequentialNumber.toString().padStart(4, '0')}`;
      setGeneratedIndex(index);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validation de la taille
      const maxSize = 50 * 1024 * 1024; // 50 MB
      if (selectedFile.size > maxSize) {
        alert('Le fichier dépasse la taille maximale de 50 MB');
        return;
      }
      
      // Validation de l'extension
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        alert('Format de fichier non supporté. Formats acceptés: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setMetadata({
      fileName: '',
      creationDate: '',
      fileSize: '',
      author: ''
    });
    setFormData(prev => ({
      ...prev,
      title: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveDraft = async () => {
    if (!file) {
      alert('Veuillez sélectionner un fichier avant de sauvegarder');
      return;
    }

    setSavingDraft(true);

    try {
      const draftData = new FormData();
      draftData.append('file', file);
      draftData.append('title', formData.title || 'Document sans titre');
      draftData.append('description', formData.description);
      draftData.append('document_type', formData.document_type);
      draftData.append('confidentiality_level', formData.confidentiality_level);
      draftData.append('keywords', formData.keywords);
      draftData.append('retention_period', formData.retention_period);
      draftData.append('classification_id', formData.classification_id);
      draftData.append('classification_path', JSON.stringify(formData.classification_path));
      draftData.append('index', generatedIndex);
      draftData.append('author', metadata.author);
      draftData.append('sequential_number', sequentialNumber);
      draftData.append('status', 'draft');

      await api.post('/documents/save-draft', draftData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Document sauvegardé comme brouillon avec succès!');
    } catch (error) {
      console.error('Save draft error:', error);
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde du brouillon');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    if (!formData.classification_id) {
      alert('Veuillez sélectionner une classification');
      return;
    }

    if (!formData.title.trim()) {
      alert('Veuillez saisir un titre pour le document');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('document_type', formData.document_type);
      uploadFormData.append('confidentiality_level', formData.confidentiality_level);
      uploadFormData.append('keywords', formData.keywords);
      uploadFormData.append('retention_period', formData.retention_period);
      uploadFormData.append('classification_id', formData.classification_id);
      uploadFormData.append('classification_path', JSON.stringify(formData.classification_path));
      uploadFormData.append('index', generatedIndex);
      uploadFormData.append('author', metadata.author);
      uploadFormData.append('sequential_number', sequentialNumber);

      const response = await api.post('/documents/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Document uploadé avec succès!');
      navigate('/documents');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'upload du document');
    } finally {
      setUploading(false);
    }
  };

  const renderClassificationOptions = (classifications, level = 0) => {
    return classifications.map((classification) => (
      <React.Fragment key={classification.id}>
        <option value={classification.id}>
          {'-'.repeat(level * 2)} {classification.code} - {classification.name}
        </option>
        {classification.children && classification.children.length > 0 && 
          renderClassificationOptions(classification.children, level + 1)
        }
      </React.Fragment>
    ));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <button
            type="button"
            onClick={() => step <= currentStep && setCurrentStep(step)}
            className={`flex flex-col items-center ${step <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step <= currentStep ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100 border-2 border-gray-300'}`}>
              {step}
            </div>
            <span className="text-sm font-medium">
              {step === 1 && 'Upload'}
              {step === 2 && 'Métadonnées'}
              {step === 3 && 'Classification'}
              {step === 4 && 'Complémentaire'}
            </span>
          </button>
          {step < 4 && (
            <div className={`h-1 w-16 mx-4 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        1. Upload du document
      </h3>
      <p className="text-gray-600 mb-6">
        Parcourez et sélectionnez un seul fichier à la fois pour chargement.
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
        <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        
        <p className="text-gray-600 mb-4 text-lg">
          Glissez-déposez votre document ici
        </p>
        <p className="text-gray-500 mb-6">ou</p>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg"
        >
          Parcourir les fichiers
        </button>
        
        <div className="mt-8 space-y-2">
          <p className="text-sm text-gray-500">
            Formats acceptés: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
          </p>
          <p className="text-sm text-gray-500">
            Taille maximale: 50 MB
          </p>
          <p className="text-sm text-gray-500 font-medium">
            Un seul fichier peut être sélectionné
          </p>
        </div>
      </div>

      {file && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Continuer vers l'étape 2
          </button>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        2. Métadonnées automatiques
      </h3>
      <p className="text-gray-600 mb-6">
        Les métadonnées suivantes ont été extraites automatiquement du document.
      </p>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Nom du fichier</p>
              <p className="font-medium text-gray-900">{metadata.fileName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Date de création</p>
              <p className="font-medium text-gray-900">{metadata.creationDate}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Hash className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Taille</p>
              <p className="font-medium text-gray-900">{metadata.fileSize}</p>
            </div>
          </div>
          
          {/* ÉTAPE 2 AMÉLIORÉE : Auteur sous format Nom Prénom */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Auteur</p>
              <p className="font-medium text-gray-900">{metadata.author}</p>
              <p className="text-xs text-gray-400 mt-1">
                Format: Prénom Nom de l'utilisateur authentifié
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Continuer vers l'étape 3
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        3. Plan de classement
      </h3>
      <p className="text-gray-600 mb-6">
        Sélectionnez le chemin hiérarchique de classement pour organiser le document.
        Un index alphanumérique unique sera généré automatiquement.
      </p>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan de classement *
          </label>
          <select
            required
            value={formData.classification_id}
            onChange={handleClassificationSelect}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Sélectionner une catégorie dans l'arborescence</option>
            {renderClassificationOptions(classifications)}
          </select>
          
          {/* ÉTAPE 3 AMÉLIORÉE : Affichage du chemin hiérarchique complet */}
          {selectedPath.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Chemin hiérarchique sélectionné :</span>
              </div>
              
              {/* Affichage du chemin avec flèches */}
              <div className="flex items-center flex-wrap gap-1 p-3 bg-white rounded border">
                {selectedPath.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <span className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">
                      {item.code}
                    </span>
                    {index < selectedPath.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Détails du chemin */}
              <div className="mt-3 text-sm text-gray-600">
                <p className="font-medium mb-1">Détails du chemin :</p>
                <div className="space-y-1">
                  {selectedPath.map((item, index) => (
                    <div key={item.id} className="flex items-center">
                      <span className="w-6 text-gray-400">{index + 1}.</span>
                      <span className="font-mono mr-2">{item.code}</span>
                      <span className="text-gray-700">- {item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro séquentiel
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg text-gray-900">
                    {sequentialNumber.toString().padStart(4, '0')}
                  </span>
                  <span className="text-sm text-gray-500">
                    Auto-incrémenté
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSequentialNumber(prev => prev + 1)}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                +1
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Index alphanumérique (généré automatiquement)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                <p className="font-mono text-gray-900 text-lg break-all">
                  {generatedIndex || "Sélectionnez un chemin de classement pour générer l'index"}
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">
                Format : [code-niveau1]-[code-niveau2]-...-[Année]-[NuméroSéquentiel]
              </p>
              <p className="text-xs text-gray-400">
                Exemple : ADM-CON-FOR-2025-0001
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(4)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Continuer vers l'étape 4
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-lg shadow p-8">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        4. Métadonnées complémentaires
      </h3>
      <p className="text-gray-600 mb-6">
        Saisissez les informations descriptives supplémentaires pour compléter le profil du document.
      </p>

      <div className="space-y-6">
        {/* Titre du document */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre du document *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Contrat de formation professionnelle 2025"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Brève description du contenu du document."
          />
        </div>

        {/* Type de document et Niveau de confidentialité */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de document
            </label>
            <div className="relative">
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">Sélectionner un type</option>
                <option value="contrat">Contrat</option>
                <option value="rapport">Rapport</option>
                <option value="proces_verbal">Procès-verbal</option>
                <option value="correspondance">Correspondance</option>
                <option value="budget">Budget</option>
                <option value="facture">Facture</option>
                <option value="devis">Devis</option>
                <option value="autre">Autre</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau de confidentialité
            </label>
            <div className="relative">
              <select
                value={formData.confidentiality_level}
                onChange={(e) => setFormData({...formData, confidentiality_level: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="public">Public</option>
                <option value="interne">Interne</option>
                <option value="confidentiel">Confidentiel</option>
                <option value="secret">Secret</option>
              </select>
              <Shield className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Mots-clés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mots-clés
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({...formData, keywords: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="formation, contrat, 2025 (séparés par des virgules)"
          />
        </div>

        {/* Durée de conservation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durée de conservation
          </label>
          <div className="relative">
            <select
              value={formData.retention_period}
              onChange={(e) => setFormData({...formData, retention_period: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">Sélectionner une durée</option>
              <option value="1">1 an</option>
              <option value="3">3 ans</option>
              <option value="5">5 ans</option>
              <option value="10">10 ans</option>
              <option value="permanent">Permanent</option>
            </select>
            <Archive className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Bonnes pratiques */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Bonnes pratiques :</span> Assurez-vous que le titre et la description sont clairs et précis. 
              Les métadonnées complètes facilitent la recherche ultérieure du document.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Retour
        </button>
        
        <div className="space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Annuler
          </button>
        
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Activation en cours...
              </div>
            ) : (
              'Activer le document'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Nouveau document</h1>
            <p className="text-gray-600">Déposez et indexez un nouveau document dans les archives</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderStepIndicator()}
        
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </form>
      </div>
    </div>
  );
};

export default Upload;