import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  User,
  Mail,
  Shield,
  Building,
  Phone,
  CheckCircle,
  AlertCircle,
  Power,
  Key,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Edit
} from 'lucide-react';
import userAPI from '../services/userAPI';

const UserForm = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    department: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Initialiser les données du formulaire
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        department: user.department || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    }
  }, [user]);

  // Gestionnaire de changement des champs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Générer mot de passe sécurisé
  const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    setPasswordStrength(4);
    setIsGenerated(true);
  };

  // Vérifier force du mot de passe
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-emerald-500';
      default:
        return 'bg-slate-300';
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    if (showResetPassword && newPassword && newPassword !== confirmPassword) {
      errors.password = 'Les mots de passe ne correspondent pas';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculer la progression
  const calculateProgress = () => {
    let progress = 0;
    if (formData.firstName.trim()) progress += 20;
    if (formData.lastName.trim()) progress += 20;
    if (formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email)) progress += 20;
    if (formData.role) progress += 20;
    if (formData.department.trim()) progress += 20;
    return Math.min(progress, 100);
  };

  // Gestionnaire clic sur l'overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  // Gestion touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, loading]);

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        is_active: formData.isActive
      };

      // Si réinitialisation de mot de passe demandée
      if (showResetPassword && newPassword) {
        apiData.new_password = newPassword;
      }

      console.log('Updating user:', user.id, apiData);
      const response = await userAPI.update(user.id, apiData);

      if (response.success) {
        onSuccess && onSuccess(response.data || response);
        
        // Afficher confirmation si mot de passe réinitialisé
        if (showResetPassword && newPassword) {
          alert(`✅ Modification réussie !\nMot de passe réinitialisé pour ${formData.firstName} ${formData.lastName}`);
        } else {
          alert(`✅ Modification réussie pour ${formData.firstName} ${formData.lastName}`);
        }
        
        onClose();
      } else {
        setError(response.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err.response?.data?.error || err.message || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn" 
      onClick={handleOverlayClick}
      style={{ zIndex: 9999999 }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100" style={{ zIndex: 10000000 }}>
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-linear-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-md">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Modifier l'utilisateur
              </h3>
              <p className="text-sm text-slate-600">
                Mettez à jour les informations de l'utilisateur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicateur de progression */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Progression de modification</span>
            <span className="text-sm font-medium text-slate-900">{calculateProgress()}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-emerald-400 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Corps du formulaire */}
        <div className="p-6">
          {/* Message d'erreur général */}
          {error && (
            <div className="mb-6 p-4 bg-linear-to-r from-red-50 to-red-100 border border-red-200 rounded-xl flex items-center animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 ml-3"
                disabled={loading}
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Grille de champs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prénom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      validationErrors.firstName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Prénom"
                    required
                    disabled={loading}
                  />
                </div>
                {validationErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      validationErrors.lastName ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Nom"
                    required
                    disabled={loading}
                  />
                </div>
                {validationErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      validationErrors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="email@exemple.com"
                    required
                    disabled={loading}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rôle
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none bg-white"
                    disabled={loading}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="gestionnaire">Gestionnaire</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              {/* Département */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Département
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Ex: RH, IT, Finance"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Statut actif */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      formData.isActive 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-slate-300'
                    }`}>
                      {formData.isActive && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Utilisateur actif</span>
                    <p className="text-sm text-slate-500 mt-1">
                      {formData.isActive 
                        ? 'L\'utilisateur pourra se connecter au système' 
                        : 'L\'utilisateur ne pourra pas se connecter'}
                    </p>
                  </div>
                  <Power className={`w-5 h-5 ml-auto ${
                    formData.isActive ? 'text-emerald-500' : 'text-slate-400'
                  }`} />
                </label>
              </div>

              {/* Option réinitialisation mot de passe */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={showResetPassword}
                      onChange={(e) => setShowResetPassword(e.target.checked)}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      showResetPassword 
                        ? 'bg-amber-500 border-amber-500' 
                        : 'border-slate-300'
                    }`}>
                      {showResetPassword && (
                        <Key className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">Réinitialiser le mot de passe</span>
                    <p className="text-sm text-slate-500 mt-1">
                      Définir un nouveau mot de passe pour cet utilisateur
                    </p>
                  </div>
                  <Key className={`w-5 h-5 ml-auto ${
                    showResetPassword ? 'text-amber-500' : 'text-slate-400'
                  }`} />
                </label>
              </div>

              {/* Champ mot de passe si réinitialisation */}
              {showResetPassword && (
                <div className="md:col-span-2 space-y-4 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-amber-800">Nouveau mot de passe</h4>
                    <button
                      type="button"
                      onClick={generateSecurePassword}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center space-x-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Générer</span>
                    </button>
                  </div>

                  {isGenerated && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-emerald-700 font-medium">
                        Mot de passe généré automatiquement
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="Nouveau mot de passe"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Indicateur de force */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">Force du mot de passe :</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength >= 4 ? 'text-emerald-600' :
                            passwordStrength >= 3 ? 'text-yellow-600' :
                            passwordStrength >= 2 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {passwordStrength >= 4 ? 'Fort' :
                             passwordStrength >= 3 ? 'Moyen' :
                             passwordStrength >= 2 ? 'Faible' : 'Très faible'}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1.5 flex-1 rounded-full transition-all ${
                                passwordStrength >= level 
                                  ? getStrengthColor(passwordStrength) 
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirmation */}
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="Confirmer le mot de passe"
                        disabled={loading}
                      />
                    </div>
                    {validationErrors.password && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.password}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section d'avertissement */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-3 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                  <p className="font-medium mb-1">Modification en temps réel</p>
                  <p>
                    {showResetPassword && newPassword
                      ? '⚠️ Le mot de passe sera réinitialisé immédiatement. Assurez-vous de le communiquer à l\'utilisateur.'
                      : 'Les modifications seront appliquées immédiatement après la mise à jour.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 hover:shadow-sm disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Mettre à jour</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default UserForm;