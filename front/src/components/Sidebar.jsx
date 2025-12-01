import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Search,
  FolderOpen,
  Archive,
  Settings,
  Upload,
  User,
  X,
  Download,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Menu de base pour tous les utilisateurs
  const baseMenuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/documents', label: 'Mes documents', icon: FileText },
    { path: '/search', label: 'Recherche', icon: Search },
    { path: '/classifications', label: 'Classifications', icon: FolderOpen },
    { path: '/archives', label: 'Archives', icon: Archive },
  ];

  // Menu admin seulement
  const adminMenuItems = [
    { path: '/admin', label: 'Paramètres', icon: Settings, adminOnly: true },
  ];

  const quickActions = [
    { path: '/upload', label: 'Télécharger', icon: Upload },
  ];

  const isActive = (path) => location.pathname === path;

  // Fonction pour obtenir le nom complet de l'utilisateur
  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur';
    
    // Essayer différents formats de nom selon la structure de l'objet user
    if (user.prenom && user.nom) {
      return `${user.prenom} ${user.nom}`;
    } else if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.fullName) {
      return user.fullName;
    } else if (user.name) {
      return user.name;
    } else if (user.email) {
      return user.email.split('@')[0]; // Retourne la partie avant @ de l'email
    } else {
      return 'Utilisateur';
    }
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === 'admin';

  return (
    <div className="h-full bg-white text-gray-800 border-r border-gray-200 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Archivage DGRH</h1>
              <p className="text-xs text-gray-500">Présidence de la République</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* User Section avec bouton déconnexion */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              {isAdmin ? (
                <Shield className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Bienvenue,</p>
              <p className="text-lg font-semibold text-gray-900">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || 'Utilisateur'}
                {isAdmin && ' ⭐'}
              </p>
            </div>
          </div>
          
          {/* Bouton déconnexion */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
            title="Se déconnecter"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 py-6">
        {/* Menu principal pour tous les utilisateurs */}
        <ul className="space-y-1">
          {baseMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-green-100 text-green-700 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Section Admin séparée si l'utilisateur est admin */}
        {isAdmin && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="px-4 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Administration
              </h3>
            </div>
            <ul className="space-y-1">
              {adminMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-900'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      <Shield className="w-3 h-3 text-blue-500 ml-auto" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Actions Rapides
        </h3>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <IconComponent className="w-4 h-4 text-green-600 group-hover:text-green-800" />
                <span className="text-sm font-medium text-green-700 group-hover:text-green-900">
                  {action.label}
                </span>
              </Link>
            );
          })}
          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group w-full">
            <Download className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
            <span className="text-sm font-medium text-blue-700 group-hover:text-blue-900">
              Exporter les données
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;