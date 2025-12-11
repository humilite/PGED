import React, { useState } from 'react';
import { Key, Lock, Eye, EyeOff, AlertCircle, X, CheckCircle, Zap } from 'lucide-react';

const ResetPasswordModal = ({ user, onClose, onReset, loading }) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);

  // Simulation de génération de mot de passe sécurisé
  const generateSecurePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    setPasswordStrength(4); // Fort
    setIsGenerated(true);
  };

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

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    onReset(newPassword);
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="p-6">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Réinitialiser le mot de passe
                </h3>
                <p className="text-sm text-slate-600">
                  Pour {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-sm text-slate-600">
                <p className="font-medium mb-2">⚠️ Cette action aura pour conséquence :</p>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 mr-2"></div>
                    <span>L'utilisateur sera déconnecté de toutes ses sessions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Le nouveau mot de passe devra être communiqué à l'utilisateur</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 mr-2"></div>
                    <span>Il est recommandé de générer un mot de passe sécurisé</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bouton générer */}
            <button
              type="button"
              onClick={generateSecurePassword}
              className="w-full px-4 py-3.5 bg-linear-to-r from-amber-50 to-amber-100 border border-amber-200 text-amber-700 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-amber-200 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Générer un mot de passe sécurisé</span>
            </button>

            {isGenerated && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-700 font-medium">
                  Mot de passe généré automatiquement
                </span>
              </div>
            )}

            {/* Champ mot de passe */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Saisir le nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Confirmer le mot de passe"
                  />
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>
            </div>

            {/* Avertissement */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">⚠️ Action irréversible</p>
                  <p>Assurez-vous de communiquer ce mot de passe à l'utilisateur. Il ne pourra pas se reconnecter sans.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 hover:shadow-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !newPassword || newPassword !== confirmPassword}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Réinitialisation...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Réinitialiser</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;