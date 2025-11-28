import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Search,
  FolderOpen,
  Archive,
  Settings,
  Upload,
  Bell,
  User,
  X,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/documents', label: 'Mes documents', icon: FileText },
    { path: '/search', label: 'Recherche', icon: Search },
    { path: '/classifications', label: 'Classifications', icon: FolderOpen },
    { path: '/archives', label: 'Archives', icon: Archive },
    { path: '/admin', label: 'Paramètres', icon: Settings },
  ];

  const quickActions = [
    { path: '/upload', label: 'Télécharger', icon: Upload },
  ];

  const isActive = (path) => location.pathname === path;

  // Données de notifications simulées
  const notifications = [
    { id: 1, text: 'Nouveau document partagé', time: '2 min', unread: true },
    { id: 2, text: 'Mise à jour des classifications', time: '1h', unread: true },
    { id: 3, text: 'Rapport trimestriel disponible', time: '3h', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="h-full bg-white text-gray-800 border-r border-gray-200 overflow-y-auto">
      {/* Header avec notifications */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Archivage DGRH</h1>
              <p className="text-xs text-gray-500">République Gabonaise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Barre de notifications */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {notifications.slice(0, 2).map((notification) => (
              <div
                key={notification.id}
                className={`text-xs p-2 rounded ${
                  notification.unread 
                    ? 'bg-green-100 border border-green-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`${notification.unread ? 'font-medium text-green-900' : 'text-gray-600'}`}>
                    {notification.text}
                  </span>
                  <span className="text-gray-400 text-xs">{notification.time}</span>
                </div>
              </div>
            ))}
          </div>
          {notifications.length > 2 && (
            <button className="w-full mt-2 text-xs text-green-600 hover:text-green-800 font-medium">
              Voir toutes les notifications
            </button>
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Bienvenue,</p>
            <p className="text-lg font-semibold text-gray-900">
              {user?.firstName || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Utilisateur'}</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
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

      {/* Filtres Section */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Filtres Associés
        </h3>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Type Contact
              <X className="w-3 h-3 ml-1 cursor-pointer" />
            </span>
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Module C2
              <X className="w-3 h-3 ml-1 cursor-pointer" />
            </span>
          </div>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm">
            <Filter className="w-4 h-4" />
            <span>Plus de filtres</span>
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="px-4 py-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Statistiques
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Documents trouvés</span>
            <span className="text-lg font-bold text-gray-900">6</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">En attente de validation</span>
            <span className="text-lg font-bold text-yellow-600">2</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Archivés ce mois</span>
            <span className="text-lg font-bold text-green-600">24</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;