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
  Calendar
} from 'lucide-react';
import userAPI from '../services/userAPI';
import CreateUserModal from './CreateUserModal';
import UserForm from './UserForm';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Debug state changes
  useEffect(() => {
    console.log('isCreateModalOpen state changed:', isCreateModalOpen);
  }, [isCreateModalOpen]);

  // Charger les utilisateurs
  const loadUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des utilisateurs - Page:', page, 'Search:', search);

      const response = await userAPI.getAll({
        page,
        limit: 10,
        search
      });

      console.log('📡 Réponse API:', response);

      if (response.success) {
        setUsers(response.data?.users || response.users || []);
        setTotalPages(response.data?.totalPages || response.totalPages || 1);
        setCurrentPage(page);
        console.log('✅ Utilisateurs chargés:', response.data?.users?.length || 0);
      } else {
        setError(response.error || 'Erreur lors du chargement des utilisateurs');
        console.error('❌ Erreur API:', response.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion au serveur');
      console.error('💥 Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Recherche en temps réel avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers(1, searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Gestionnaire de changement de page
  const handlePageChange = (page) => {
    loadUsers(page, searchTerm);
  };

  // Gestionnaire d'ouverture du modal de création
  const handleCreateClick = () => {
    console.log('handleCreateClick called, setting isCreateModalOpen to true');
    setIsCreateModalOpen(true);
    setError(null);
    console.log('isCreateModalOpen should now be true');
  };

  // Gestionnaire d'ouverture du modal d'édition
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
    setError(null);
  };

  // Gestionnaire d'ouverture du modal de suppression
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Gestionnaire de suppression
  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await userAPI.delete(selectedUser.id);

      if (response.success) {
        setShowDeleteModal(false);
        loadUsers(currentPage, searchTerm);
      } else {
        setError(response.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
      console.error('Erreur suppression:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir la classe CSS du rôle
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Fonction pour obtenir l'icône du rôle
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'moderator':
        return <User className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600">Créez et gérez les utilisateurs du système</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou département..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <XCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-2" />
                      {user.department || 'Non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {user.isActive ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Précédent
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> sur{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      ‹
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                      const page = Math.max(1, currentPage - 2) + index;
                      if (page > totalPages) return null;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'z-10 bg-green-50 border-green-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      ›
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}

        {users.length === 0 && !loading && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Modal de création */}
      {isCreateModalOpen && (
        <>
          {console.log('Rendering CreateUserModal')}
          <CreateUserModal
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              loadUsers(currentPage, searchTerm);
            }}
          />
        </>
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
            loadUsers(currentPage, searchTerm);
          }}
        />
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirmer la suppression
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ?
                <br />
                <span className="text-sm text-red-600">Cette action est irréversible.</span>
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;