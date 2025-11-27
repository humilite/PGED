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
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/search', label: 'Mes documents', icon: FileText },
    { path: '/search', label: 'Recherche', icon: Search },
    { path: '/search', label: 'Classifications', icon: FolderOpen },
    { path: '/search', label: 'Archives', icon: Archive },
    { path: '/admin', label: 'Paramètres', icon: Settings },
  ];

  const quickActions = [
    { path: '/upload', label: 'Télécharger', icon: Upload },
    { path: '/dashboard', label: 'Notifications', icon: Bell },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white shadow-lg z-10">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">PGED</h1>
              <p className="text-xs text-slate-400">Gestion Documents</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* User Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium">Bienvenue,</p>
            <p className="text-sm text-slate-300">{user?.firstName || 'Utilisateur'}</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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

      {/* Statistics Section */}
      <div className="px-4 py-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">STATISTIQUES</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Documents actifs</span>
            <span className="text-white font-medium">24</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">En attente</span>
            <span className="text-yellow-400 font-medium">3</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Archivés</span>
            <span className="text-green-400 font-medium">156</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">ACTIONS RAPIDES</h3>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <IconComponent className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
