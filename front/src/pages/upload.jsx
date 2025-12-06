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
  Archive,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronDown
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
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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

  // Étapes du formulaire
  const steps = [
    { id: 1, title: 'Upload', description: 'Sélection du fichier' },
    { id: 2, title: 'Métadonnées', description: 'Informations automatiques' },
    { id: 3, title: 'Classification', description: 'Plan de classement' },
    { id: 4, title: 'Complémentaire', description: 'Détails supplémentaires' }
  ];

  useEffect(() => {
    fetchClassifications();
    loadSequentialNumber();
  }, []);

  useEffect(() => {
    if (file) {
      const fileName = file.name;
      const fileSize = formatFileSize(file.size);
      const creationDate = new Date().toLocaleDateString('fr-FR');
      
      let author = 'Utilisateur';
      if (user) {
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
      
      setFormData(prev => ({
        ...prev,
        title: fileName.replace(/\.[^/.]+$/, "")
      }));
    }
  }, [file, user]);

  useEffect(() => {
    if (selectedPath.length > 0) {
      generateIndex();
    }
  }, [selectedPath, sequentialNumber]);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!file) newErrors.file = 'Veuillez sélectionner un fichier';
        break;
      case 2:
        if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
        break;
      case 3:
        if (!formData.classification_id) newErrors.classification = 'La classification est requise';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const loadSequentialNumber = async () => {
    try {
      const response = await api.get('/documents/last-sequence');
      if (response.data?.lastSequence) {
        setSequentialNumber(response.data.lastSequence + 1);
      }
    } catch (error) {
      console.error('Error loading sequence number:', error);
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
      
      if (classification.children?.length > 0) {
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
      const codes = selectedPath.map(item => item.code || 'CODE').join('-');
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleFileValidation = (selectedFile) => {
    const maxSize = 50 * 1024 * 1024;
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (selectedFile.size > maxSize) {
      setErrors(prev => ({ ...prev, file: 'Le fichier dépasse la taille maximale de 50 MB' }));
      return;
    }
    
    if (!allowedExtensions.includes(fileExtension)) {
      setErrors(prev => ({ ...prev, file: 'Format de fichier non supporté' }));
      return;
    }
    
    setErrors(prev => ({ ...prev, file: null }));
    setFile(selectedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileValidation(selectedFile);
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
      setErrors(prev => ({ ...prev, file: 'Veuillez sélectionner un fichier' }));
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Document sauvegardé comme brouillon avec succès!');
      navigate('/documents');
    } catch (error) {
      console.error('Save draft error:', error);
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde du brouillon');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

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
        headers: { 'Content-Type': 'multipart/form-data' },
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
          {'–'.repeat(level)} {classification.code} - {classification.name}
        </option>
        {classification.children?.length > 0 && 
          renderClassificationOptions(classification.children, level + 1)
        }
      </React.Fragment>
    ));
  };

  const renderStepIndicator = () => (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center relative">
              <button
                type="button"
                onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                className="flex flex-col items-center group"
                disabled={step.id > currentStep}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                  step.id === currentStep 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
                    : step.id < currentStep 
                    ? 'bg-green-100 text-green-600 border-2 border-green-600' 
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-300'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </div>
                <div className="text-center">
                  <p className={`font-medium text-sm mb-1 ${
                    step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </button>
              {step.id < currentStep && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-24 h-1 bg-green-600"></div>
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Sélection du fichier
        </h3>
        <p className="text-gray-600">
          Parcourez ou glissez-déposez votre document
        </p>
      </div>

      <div
        className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-green-500 bg-green-50 scale-[1.02]' 
            : errors.file 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="max-w-md mx-auto">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-linear-t-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center">
              <FolderOpen className="h-10 w-10 text-green-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <UploadIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <p className="text-gray-700 mb-4 text-lg font-medium">
            Glissez-déposez votre document ici
          </p>
          <p className="text-gray-500 mb-6">ou</p>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            className="hidden"
            id="file-upload"
          />
          
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 bg-linear-to-r from-green-600 to-emerald-600 text-white px-8 py-3.5 rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <UploadIcon className="h-5 w-5" />
            Parcourir les fichiers
          </label>
          
          {errors.file && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{errors.file}</span>
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <File className="h-4 w-4 inline-block mr-2" />
              Formats acceptés
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Hash className="h-4 w-4 inline-block mr-2" />
              Max. 50 MB
            </div>
          </div>
        </div>
      </div>

      {file && (
        <div className="mt-8 animate-fade-in">
          <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <File className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span>{formatFileSize(file.size)}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>Prêt à être indexé</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer le fichier"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
                >
                  Continuer
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Métadonnées automatiques
          </h3>
        </div>
        <p className="text-gray-600">
          Informations extraites automatiquement de votre document
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { icon: FileText, label: 'Nom du fichier', value: metadata.fileName, color: 'blue' },
          { icon: Calendar, label: 'Date de création', value: metadata.creationDate, color: 'purple' },
          { icon: Hash, label: 'Taille du fichier', value: metadata.fileSize, color: 'indigo' },
          { icon: User, label: 'Auteur', value: metadata.author, color: 'green' }
        ].map((item, index) => (
          <div key={index} className="group p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <item.icon className={`h-6 w-6 text-${item.color}-600`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                <p className="font-medium text-gray-900">{item.value || 'Non disponible'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Titre du document *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => {
            setFormData({...formData, title: e.target.value});
            if (errors.title) setErrors(prev => ({ ...prev, title: null }));
          }}
          className={`w-full border rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-green-500/30 focus:border-green-500 transition-all ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Donnez un titre significatif à votre document"
        />
        {errors.title && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.title}
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Ce titre sera utilisé pour identifier le document dans le système
        </p>
      </div>

      <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={handlePrevStep}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-xl hover:bg-green-700 font-medium transition-colors shadow-sm"
        >
          Continuer vers la classification
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Layers className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Plan de classement
          </h3>
        </div>
        <p className="text-gray-600">
          Sélectionnez la position hiérarchique du document pour générer son index unique
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Sélectionnez une catégorie *
          </label>
          <div className="relative">
            <select
              required
              value={formData.classification_id}
              onChange={handleClassificationSelect}
              className={`w-full border rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-green-500/30 focus:border-green-500 appearance-none transition-all ${
                errors.classification ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionnez dans l'arborescence...</option>
              {renderClassificationOptions(classifications)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          {errors.classification && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.classification}
            </p>
          )}
        </div>

        {selectedPath.length > 0 && (
          <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Layers className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Chemin hiérarchique sélectionné</h4>
                <p className="text-sm text-gray-600">Vérifiez le chemin avant de continuer</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center flex-wrap gap-2 p-4 bg-white rounded-lg border">
                {selectedPath.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <span className="font-mono font-semibold text-gray-900">{item.code}</span>
                      <span className="text-sm text-gray-600">• {item.name}</span>
                    </div>
                    {index < selectedPath.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Numéro séquentiel
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-2xl font-bold text-gray-900">
                          {sequentialNumber.toString().padStart(4, '0')}
                        </span>
                        <span className="text-sm text-gray-500">
                          Auto-incrémenté
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSequentialNumber(prev => prev + 1)}
                    className="px-5 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    title="Incrémenter manuellement"
                  >
                    +1
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Index généré
                </label>
                <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <p className="font-mono text-2xl font-bold text-gray-900 break-all text-center">
                    {generatedIndex}
                  </p>
                </div>
                <p className="mt-3 text-sm text-gray-500 text-center">
                  Format: [code-niveau1]-[code-niveau2]-...-[Année]-[NuméroSéquentiel]
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
        <button
          type="button"
          onClick={handlePrevStep}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-xl hover:bg-green-700 font-medium transition-colors shadow-sm"
        >
          Continuer vers les détails
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Tag className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Métadonnées complémentaires
          </h3>
        </div>
        <p className="text-gray-600">
          Complétez les informations pour faciliter la recherche et la gestion du document
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-green-500/30 focus:border-green-500 transition-all resize-none"
            placeholder="Décrivez le contenu et l'objectif de ce document..."
          />
          <p className="mt-2 text-sm text-gray-500">
            Une description claire améliore la recherche et la compréhension du document
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de document
            </label>
            <div className="relative">
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-green-500/30 focus:border-green-500 appearance-none transition-all"
              >
                <option value="">Sélectionnez un type</option>
                <option value="contrat">Contrat</option>
                <option value="rapport">Rapport</option>
                <option value="proces_verbal">Procès-verbal</option>
                <option value="correspondance">Correspondance</option>
                <option value="budget">Budget</option>
                <option value="facture">Facture</option>
                <option value="devis">Devis</option>
                <option value="autre">Autre</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Niveau de confidentialité
            </label>
            <div className="relative">
              <select
                value={formData.confidentiality_level}
                onChange={(e) => setFormData({...formData, confidentiality_level: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-green-500/30 focus:border-green-500 appearance-none transition-all"
              >
                <option value="public">Public</option>
                <option value="interne">Interne</option>
                <option value="confidentiel">Confidentiel</option>
                <option value="secret">Secret</option>
              </select>
              <Shield className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mots-clés
          </label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) => setFormData({...formData, keywords: e.target.value})}
            className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-green-500/30 focus:border-green-500 transition-all"
            placeholder="Ex: formation, contrat, 2025 (séparés par des virgules)"
          />
          <p className="mt-2 text-sm text-gray-500">
            Ajoutez des mots-clés pertinents pour une recherche plus efficace
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Durée de conservation
          </label>
          <div className="relative">
            <select
              value={formData.retention_period}
              onChange={(e) => setFormData({...formData, retention_period: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-3 focus:ring-green-500/30 focus:border-green-500 appearance-none transition-all"
            >
              <option value="">Sélectionnez une durée</option>
              <option value="1">1 an</option>
              <option value="3">3 ans</option>
              <option value="5">5 ans</option>
              <option value="10">10 ans</option>
              <option value="permanent">Permanent</option>
            </select>
            <Archive className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-700">Options avancées</span>
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 animate-fade-in">
            <h4 className="font-medium text-gray-900 mb-4">Configuration avancée</h4>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-gray-600 mb-2">Version du document</p>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: 1.0"
                />
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-gray-600 mb-2">Langue du document</p>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="es">Espagnol</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="bg-linear-t-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-2">Conseil de qualité</h4>
              <p className="text-sm text-green-700">
                Des métadonnées complètes et précises garantissent une meilleure traçabilité et facilitent la recherche future.
                Prenez le temps de bien renseigner tous les champs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            Étape précédente
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={uploading}
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-green-600 to-emerald-600 text-white px-8 py-3.5 rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Traitement en cours...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Finaliser l'upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nouveau document</h1>
                <p className="text-gray-600 mt-1">Ajoutez un document à votre système de gestion documentaire</p>
              </div>
              <div className="text-sm text-gray-500">
                {currentStep} sur {steps.length} étapes
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderStepIndicator()}
        
        <div className="relative">
          <div className="absolute -inset-1 bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-10"></div>
          <form onSubmit={handleSubmit} className="relative">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;