import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Shield,
  Building,
  CheckCircle,
  XCircle,
  Calendar,
  Power,
  Mail,
  Phone,
  MoreVertical,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  Key,
  AlertCircle,
  MailCheck,
  Zap,
  Lock,
  UserPlus
} from 'lucide-react';
import userAPI from '../services/userAPI';
import CreateUserModal from './CreateUserModal';
import UserForm from './UserForm';
import ResetPasswordModal from './ResetPasswordModal';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Stocker tous les utilisateurs pour le filtrage côté client
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    department: '',
    recentActivity: false
  });
  const [sortField, setSortField] = useState('lastName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [stats, setStats] = useState({
    active: 0,
    inactive: 0,
    admins: 0
  });
  const [departments, setDepartments] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Fonction pour obtenir l'icône du rôle
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5" />;
      case 'moderator':
      case 'gestionnaire':
        return <User className="w-3.5 h-3.5" />;
      default:
        return <User className="w-3.5 h-3.5" />;
    }
  };

  // Extraire les départements uniques
  const extractDepartments = (usersData) => {
    const depts = [...new Set(usersData.map(u => u.department).filter(Boolean))];
    setDepartments(depts);
  };

  // Fonction pour appliquer les filtres
  const applyFilters = (usersData, search = '', filterParams = filters) => {
    let filtered = [...usersData];

    // Filtre de recherche
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par rôle
    if (filterParams.role) {
      filtered = filtered.filter(user => user.role === filterParams.role);
    }

    // Filtre par statut
    if (filterParams.status === 'active') {
      filtered = filtered.filter(user => user.isActive);
    } else if (filterParams.status === 'inactive') {
      filtered = filtered.filter(user => !user.isActive);
    }

    // Filtre par département
    if (filterParams.department) {
      filtered = filtered.filter(user => user.department === filterParams.department);
    }

    // Filtre par activité récente
    if (filterParams.recentActivity) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter(user => {
        if (!user.lastLogin) return false;
        const lastLoginDate = new Date(user.lastLogin);
        return lastLoginDate >= yesterday;
      });
    }

    // Trier les utilisateurs
    filtered.sort((a, b) => {
      const fieldA = a[sortField]?.toString().toLowerCase() || '';
      const fieldB = b[sortField]?.toString().toLowerCase() || '';
      
      if (sortDirection === 'asc') {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });

    return filtered;
  };

  // Fonction pour paginer les résultats
  const paginateUsers = (usersData, page, size = pageSize) => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return usersData.slice(startIndex, endIndex);
  };

  const loadUsers = async (page = 1, search = '', filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      // Charger tous les utilisateurs (si pas encore chargés)
      if (allUsers.length === 0) {
        const response = await userAPI.getAll({
          page: 1,
          limit: 1000 // Charger beaucoup d'utilisateurs pour le filtrage côté client
        });

        if (response.success) {
          const usersData = response.data?.users || response.users || [];
          setAllUsers(usersData);
          
          // Extraire les départements
          extractDepartments(usersData);
          
          // Calculer les statistiques initiales
          const activeCount = usersData.filter(u => u.isActive).length;
          const adminCount = usersData.filter(u => u.role === 'admin').length;
          
          setStats({
            active: activeCount,
            inactive: usersData.length - activeCount,
            admins: adminCount
          });
          setTotalUsers(usersData.length);
        } else {
          setError(response.error || 'Erreur lors du chargement des utilisateurs');
          return;
        }
      }

      // Appliquer les filtres
      const filteredUsers = applyFilters(allUsers, search, filterParams);
      
      // Mettre à jour les statistiques basées sur les filtres
      const activeCount = filteredUsers.filter(u => u.isActive).length;
      const adminCount = filteredUsers.filter(u => u.role === 'admin').length;
      
      setStats({
        active: activeCount,
        inactive: filteredUsers.length - activeCount,
        admins: adminCount
      });
      setTotalUsers(filteredUsers.length);
      
      // Paginer les résultats
      const totalPagesCount = Math.ceil(filteredUsers.length / pageSize);
      const paginatedUsers = paginateUsers(filteredUsers, page);
      
      setUsers(paginatedUsers);
      setTotalPages(totalPagesCount);
      setCurrentPage(page);

    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers(1, searchTerm, filters);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters, sortField, sortDirection]);

  // Effet pour recharger quand le tri change
  useEffect(() => {
    if (allUsers.length > 0) {
      loadUsers(currentPage, searchTerm, filters);
    }
  }, [sortField, sortDirection]);

  const handlePageChange = (page) => {
    loadUsers(page, searchTerm, filters);
  };

  // Ajouter une fonction pour gérer le tri
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Modifier handleFilterChange pour recharger avec la page 1
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Retourner à la première page quand on change un filtre
  };

  // Modifier les fonctions qui modifient les utilisateurs pour mettre à jour allUsers
  const handleDeactivate = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await userAPI.update(selectedUser.id, {
        isActive: !selectedUser.isActive
      });

      if (response.success) {
        setShowDeactivateModal(false);
        
        // Mettre à jour l'utilisateur dans allUsers
        setAllUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, isActive: !selectedUser.isActive }
            : user
        ));
        
        // Recharger avec les filtres actuels
        loadUsers(currentPage, searchTerm, filters);
      } else {
        setError(response.error || 'Erreur lors de la désactivation');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la désactivation');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les titres des colonnes pour indiquer le tri
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Fonction pour réinitialiser complètement les filtres
  const handleResetAllFilters = () => {
    setFilters({ role: '', status: '', department: '', recentActivity: false });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
    setError(null);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
    setError(null);
  };

  const handleDeactivateClick = (user) => {
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  const handleResetPasswordClick = (user) => {
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async (newPassword) => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await userAPI.resetPassword(selectedUser.id, newPassword);

      if (response.success) {
        setShowResetPasswordModal(false);
        setError(null);
        alert(`Mot de passe réinitialisé avec succès pour ${selectedUser.firstName} ${selectedUser.lastName}`);
      } else {
        setError(response.error || 'Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-linear-to-r from-red-500/10 to-red-600/10 text-red-700 border border-red-200 shadow-sm';
      case 'moderator':
      case 'gestionnaire':
        return 'bg-linear-to-r from-purple-500/10 to-purple-600/10 text-purple-700 border border-purple-200 shadow-sm';
      case 'user':
        return 'bg-linear-to-r from-blue-500/10 to-blue-600/10 text-blue-700 border border-blue-200 shadow-sm';
      default:
        return 'bg-linear-to-r from-gray-500/10 to-gray-600/10 text-gray-700 border border-gray-200 shadow-sm';
    }
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive 
      ? 'bg-linear-to-r from-green-500/10 to-emerald-600/10 text-emerald-700 border border-emerald-200 shadow-sm'
      : 'bg-linear-to-r from-red-500/10 to-red-600/10 text-red-700 border border-red-200 shadow-sm';
  };

  const formatUserId = (id) => {
    if (!id) return 'N/A';
    const idString = String(id);
    return idString.length > 8 ? `${idString.substring(0, 8)}...` : idString;
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      
      // Exporter les utilisateurs filtrés
      const filteredUsers = applyFilters(allUsers, searchTerm, filters);
      const dataStr = JSON.stringify(filteredUsers, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `utilisateurs_${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      setError('Erreur lors de l\'export');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Chargement des utilisateurs</h3>
          <p className="text-slate-500">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-1 md:p-1">
      {/* Header avec statistiques */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              Gestion des utilisateurs
            </h1>
            <p className="text-slate-600">
              {totalUsers} utilisateur{totalUsers !== 1 ? 's' : ''} trouvé{totalUsers !== 1 ? 's' : ''} 
              {Object.values(filters).some(f => f !== '' && f !== false) ? ' (filtrés)' : ''}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium flex items-center space-x-2 hover:bg-slate-50 transition-all hover:shadow-sm disabled:opacity-50"
            >
              {exportLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden md:inline">Exporter</span>
            </button>
            
            <button
              onClick={handleCreateClick}
              className="group relative bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-3 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-200 active:scale-95 shadow-md"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
              <UserPlus className="w-5 h-5" />
              <span>Nouvel Utilisateur</span>
            </button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-linear-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 mb-1">Actifs</p>
                <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
                <p className="text-xs text-emerald-500 mt-1">
                  {totalUsers > 0 ? `+${Math.round((stats.active / totalUsers) * 100)}%` : '0%'}
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 mb-1">Inactifs</p>
                <p className="text-3xl font-bold text-slate-900">{stats.inactive}</p>
                <p className="text-xs text-amber-500 mt-1">À vérifier</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <XCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 mb-1">Administrateurs</p>
                <p className="text-3xl font-bold text-slate-900">{stats.admins}</p>
                <p className="text-xs text-red-500 mt-1">Accès complet</p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total filtré</p>
                <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {allUsers.length > 0 ? `sur ${allUsers.length} au total` : 'Tous utilisateurs'}
                </p>
              </div>
              <div className="w-14 h-14 bg-linear-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres avancés */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 bg-slate-50 focus:bg-white placeholder-slate-400"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3.5 border rounded-xl font-medium flex items-center space-x-2 transition-all ${
                showFilters 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>
                Filtres 
                {Object.values(filters).filter(f => f !== '' && f !== false).length > 0 && 
                  ` (${Object.values(filters).filter(f => f !== '' && f !== false).length})`}
              </span>
            </button>
            
            <button
              onClick={() => loadUsers(1, searchTerm, filters)}
              className="px-4 py-3.5 border border-slate-300 text-slate-700 rounded-xl font-medium flex items-center space-x-2 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">Actualiser</span>
            </button>

            {(searchTerm || Object.values(filters).some(f => f !== '' && f !== false)) && (
              <button
                onClick={handleResetAllFilters}
                className="px-4 py-3.5 border border-slate-300 text-slate-700 rounded-xl font-medium flex items-center space-x-2 hover:bg-slate-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span className="hidden md:inline">Tout réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Panneau des filtres dynamiques */}
        {showFilters && (
          <div className="mt-6 p-5 bg-linear-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rôle
                </label>
                <select 
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="">Tous les rôles</option>
                  <option value="admin">Administrateur</option>
                  <option value="moderator">Gestionnaire</option>
                  <option value="gestionnaire">Gestionnaire</option>
                  <option value="user">Utilisateur</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Statut
                </label>
                <select 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Département
                </label>
                <select 
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="">Tous départements</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.recentActivity}
                    onChange={(e) => handleFilterChange('recentActivity', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">Activité récente (24h)</span>
                </label>
              </div>
            </div>
            
            {/* Boutons d'action filtres */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => setFilters({ role: '', status: '', department: '', recentActivity: false })}
                className="text-sm text-slate-600 hover:text-slate-800 flex items-center space-x-1"
              >
                <XCircle className="w-4 h-4" />
                <span>Réinitialiser les filtres</span>
              </button>
              
              <div className="text-sm text-slate-500">
                {users.length} résultat{users.length !== 1 ? 's' : ''} sur la page
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-linear-to-r from-red-50 to-red-100 border border-red-200 rounded-xl flex items-center shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tableau des utilisateurs avec en-têtes cliquables pour le tri */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-linear-to-r from-slate-50 to-slate-100">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => handleSort('lastName')}
                >
                  Utilisateur {getSortIndicator('lastName')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  Contact {getSortIndicator('email')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => handleSort('role')}
                >
                  Rôle {getSortIndicator('role')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => handleSort('department')}
                >
                  Département {getSortIndicator('department')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => handleSort('isActive')}
                >
                  Statut {getSortIndicator('isActive')}
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => handleSort('lastLogin')}
                >
                  Dernière activité {getSortIndicator('lastLogin')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-linear-to-r hover:from-slate-50 hover:to-white transition-all duration-200 group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 bg-linear-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-md">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        {user.isActive && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          ID: {formatUserId(user.id)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="truncate max-w-[200px]">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400 mr-2" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-2 capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-sm text-slate-600">
                      <Building className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="bg-slate-100 px-2 py-1 rounded-lg">
                        {user.department || 'Non spécifié'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeClass(user.isActive)}`}>
                      {user.isActive ? (
                        <CheckCircle className="w-3.5 h-3.5 mr-2" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 mr-2" />
                      )}
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-slate-600">
                      <div className="flex items-center mb-1">
                        <Clock className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="font-medium">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                        </span>
                      </div>
                      {user.lastLogin && (
                        <div className="text-xs text-slate-400 flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {new Date(user.lastLogin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 group/edit"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleResetPasswordClick(user)}
                        className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-all duration-200 group/key"
                        title="Réinitialiser mot de passe"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeactivateClick(user)}
                        className={`p-2 rounded-lg transition-all duration-200 group/power ${
                          user.isActive 
                            ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' 
                            : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                        }`}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination améliorée */}
        {totalPages > 1 && (
          <div className="bg-linear-to-r from-slate-50 to-slate-100 px-6 py-4 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Affichage de <span className="font-semibold">{users.length}</span> utilisateurs sur{' '}
                <span className="font-semibold">{totalUsers}</span> trouvés
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-sm"
                >
                  <ChevronUp className="w-4 h-4 rotate-90" />
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const page = Math.max(1, currentPage - 2) + index;
                    if (page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                          page === currentPage
                            ? 'bg-linear-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-sm"
                >
                  <ChevronUp className="w-4 h-4 -rotate-90" />
                </button>
              </div>
              
              <div className="text-sm text-slate-600">
                Page <span className="font-semibold">{currentPage}</span> sur{' '}
                <span className="font-semibold">{totalPages}</span>
              </div>
            </div>
          </div>
        )}

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {searchTerm || Object.values(filters).some(f => f !== '' && f !== false)
                ? 'Aucun utilisateur ne correspond aux critères de recherche et de filtrage'
                : 'Commencez par ajouter un nouvel utilisateur'}
            </p>
            {(searchTerm || Object.values(filters).some(f => f !== '' && f !== false)) && (
              <button
                onClick={handleResetAllFilters}
                className="mb-4 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-300 inline-flex items-center space-x-2 shadow-sm"
              >
                <XCircle className="w-5 h-5" />
                <span>Réinitialiser les filtres</span>
              </button>
            )}
            <button
              onClick={handleCreateClick}
              className="ml-4 bg-linear-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 inline-flex items-center space-x-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de création */}
      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            // Recharger tous les utilisateurs pour inclure le nouveau
            setAllUsers([]); // Forcer un rechargement complet
            loadUsers(1, searchTerm, filters);
          }}
        />
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedUser && (
        <UserForm
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            // Recharger tous les utilisateurs pour inclure les modifications
            setAllUsers([]); // Forcer un rechargement complet
            loadUsers(currentPage, searchTerm, filters);
          }}
        />
      )}

      {/* Modal de réinitialisation de mot de passe */}
      {showResetPasswordModal && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => {
            setShowResetPasswordModal(false);
            setSelectedUser(null);
          }}
          onReset={handleResetPassword}
          loading={loading}
        />
      )}

      {/* Modal de confirmation de désactivation */}
      {showDeactivateModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div className="p-6">
              <div className={`flex items-center justify-center w-16 h-16 mx-auto rounded-2xl mb-4 bg-linear-to-br ${
                selectedUser.isActive ? 'from-orange-100 to-orange-50' : 'from-emerald-100 to-emerald-50'
              }`}>
                <Power className={`w-8 h-8 ${
                  selectedUser.isActive ? 'text-orange-600' : 'text-emerald-600'
                }`} />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 text-center mb-3">
                {selectedUser.isActive ? 'Désactiver' : 'Activer'} l'utilisateur
              </h3>
              
              <p className="text-slate-600 text-center mb-6">
                Êtes-vous sûr de vouloir {selectedUser.isActive ? 'désactiver' : 'activer'} l'utilisateur{' '}
                <span className="font-semibold text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</span> ?
              </p>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-slate-600">
                  <span className={`font-medium ${
                    selectedUser.isActive ? 'text-orange-600' : 'text-emerald-600'
                  }`}>
                    {selectedUser.isActive 
                      ? "⚠️ L'utilisateur ne pourra plus se connecter au système."
                      : "✅ L'utilisateur pourra à nouveau se connecter."}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 hover:shadow-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 text-sm font-medium text-white rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 ${
                    selectedUser.isActive 
                      ? 'bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700' 
                      : 'bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Traitement...
                    </span>
                  ) : (
                    selectedUser.isActive ? 'Désactiver' : 'Activer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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

export default UserList;