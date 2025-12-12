import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import {
  User,
  Mail,
  Shield,
  Key,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Settings,
  UserCheck,
  ShieldCheck,
  Bell,
  Clock
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [userStats, setUserStats] = useState({
    lastLogin: user?.lastLogin || null,
    accountCreated: user?.createdAt || null,
    loginCount: user?.loginCount || 0
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
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

  const getStrengthText = (strength) => {
    switch (strength) {
      case 0:
        return 'Très faible';
      case 1:
        return 'Faible';
      case 2:
        return 'Moyen';
      case 3:
        return 'Bon';
      case 4:
        return 'Fort';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await usersAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setMessage({
        text: '✅ Mot de passe changé avec succès !',
        type: 'success'
      });
      
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Animation de succès
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);

      let errorMessage = 'Erreur lors du changement de mot de passe';

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.error || 'Mot de passe actuel incorrect';
        } else if (error.response.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        } else if (error.response.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          errorMessage = error.response.data?.error || `Erreur ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      } else {
        errorMessage = error.message || 'Une erreur inattendue s\'est produite';
      }

      setMessage({
        text: `⚠️ ${errorMessage}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête principal */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Mon Profil
              </h1>
              <p className="text-slate-600">
                Gérez vos informations personnelles et votre sécurité
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 mb-1">Dernière connexion</p>
                  <p className="text-lg font-bold text-slate-900">
                    {userStats.lastLogin ? formatDate(userStats.lastLogin) : 'Jamais'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 mb-1">Compte créé le</p>
                  <p className="text-lg font-bold text-slate-900">
                    {userStats.accountCreated ? formatDate(userStats.accountCreated) : 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 mb-1">Connexions totales</p>
                  <p className="text-lg font-bold text-slate-900">{userStats.loginCount}</p>
                </div>
                <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                  <Bell className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : Informations utilisateur */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte d'informations personnelles */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-linear-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Informations personnelles
                    </h2>
                    <p className="text-sm text-slate-600">
                      Vos informations de compte
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2  items-center">
                        <User className="w-4 h-4 text-slate-400 mr-2" />
                        Nom complet
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-slate-900 font-medium">
                          {user?.name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 items-center">
                        <Mail className="w-4 h-4 text-slate-400 mr-2" />
                        Email
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-slate-900 font-medium">
                          {user?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 items-center">
                        <Shield className="w-4 h-4 text-slate-400 mr-2" />
                        Rôle
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user?.role === 'admin' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : user?.role === 'moderator'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {user?.role === 'admin' && <Shield className="w-3 h-3 mr-2" />}
                          <span className="capitalize">{user?.role || 'N/A'}</span>
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2 items-center">
                        <Key className="w-4 h-4 text-slate-400 mr-2" />
                        ID Utilisateur
                      </label>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <p className="text-slate-900 font-mono text-sm">
                          {user?.id || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte de sécurité */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Sécurité du compte
                    </h2>
                    <p className="text-sm text-slate-600">
                      Protégez votre compte avec un mot de passe fort
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Message d'état */}
                {message.text && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center animate-fadeIn ${
                    message.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        message.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                      }`}>
                        {message.text}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mot de passe actuel */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Mot de passe actuel *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                          errors.currentPassword ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Entrez votre mot de passe actuel"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        disabled={loading}
                      >
                        {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* Nouveau mot de passe */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nouveau mot de passe *
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                          errors.newPassword ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Entrez votre nouveau mot de passe"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        disabled={loading}
                      >
                        {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Indicateur de force */}
                    {formData.newPassword && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-600">Force du mot de passe :</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength >= 4 ? 'text-emerald-600' :
                            passwordStrength >= 3 ? 'text-yellow-600' :
                            passwordStrength >= 2 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {getStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <div className="flex space-x-1 mb-2">
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
                        <p className="text-xs text-slate-500">
                          Utilisez au moins 8 caractères avec des majuscules, chiffres et caractères spéciaux
                        </p>
                      </div>
                    )}
                    
                    {errors.newPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirmation du mot de passe */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirmer le nouveau mot de passe *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                          errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Confirmez votre nouveau mot de passe"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        disabled={loading}
                      >
                        {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Bouton de soumission */}
                  <div className="flex justify-end pt-6 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 text-sm font-medium text-white bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 flex items-center space-x-2 shadow-md"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Changement en cours...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Mettre à jour le mot de passe</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Colonne droite : Conseils de sécurité */}
          <div className="space-y-6">
            {/* Carte de conseils */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-md">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Conseils de sécurité
                    </h2>
                    <p className="text-sm text-slate-600">
                      Protégez votre compte efficacement
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Utilisez un mot de passe unique</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Ne réutilisez pas vos mots de passe sur différents sites
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-xl">
                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-emerald-600 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Activez l'authentification à deux facteurs</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-xl">
                    <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-amber-600 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Changez régulièrement</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Mettez à jour votre mot de passe tous les 3 mois
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-purple-600 text-xs font-bold">4</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Soyez vigilant</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Ne partagez jamais vos informations de connexion
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte de statut de sécurité */}
            <div className="bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Statut de sécurité</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Force du mot de passe</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    passwordStrength >= 4 ? 'bg-emerald-100 text-emerald-700' :
                    passwordStrength >= 3 ? 'bg-yellow-100 text-yellow-700' :
                    passwordStrength >= 2 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {getStrengthText(passwordStrength)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Dernière mise à jour</span>
                  <span className="text-sm text-slate-900 font-medium">
                    {user?.passwordUpdatedAt ? formatDate(user.passwordUpdatedAt) : 'Jamais'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Sécurité du compte</span>
                  <span className="text-sm font-medium text-emerald-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Forte
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 text-center">
                  Votre sécurité est notre priorité. Gardez vos informations à jour.
                </p>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default Profile;