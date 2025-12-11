const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fonction utilitaire pour obtenir les en-têtes d'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fonction utilitaire pour convertir camelCase en snake_case
const toSnakeCase = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
};

const userAPI = {
  // Récupérer tous les utilisateurs (avec pagination et recherche)
  getAll: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des utilisateurs');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error getting users:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Créer un nouvel utilisateur
  create: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de l\'utilisateur');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Mettre à jour un utilisateur
  update: async (id, userData) => {
    try {
      // Convertir les données camelCase en snake_case pour l'API backend
      const apiData = toSnakeCase(userData);

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(apiData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour de l\'utilisateur');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Supprimer un utilisateur
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression de l\'utilisateur');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obtenir les statistiques des utilisateurs
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des statistiques');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Recherche avancée avec filtres multiples
  advancedSearch: async (filters = {}, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC') => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortOrder', sortOrder);

      // Ajouter les filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_BASE_URL}/users/advanced-search?${queryParams}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche avancée');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error advanced search:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Opérations en masse
  bulkUpdate: async (userIds, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/bulk-operations`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userIds, updates }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour en masse');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error bulk update:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  bulkDelete: async (userIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/bulk-operations`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userIds }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression en masse');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error bulk delete:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Récupérer les activités d'un utilisateur
  getUserActivity: async (userId, page = 1, limit = 20) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      const response = await fetch(`${API_BASE_URL}/users/${userId}/activity?${queryParams}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des activités');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error getting user activity:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Récupérer les départements disponibles
  getDepartments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/departments`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des départements');
      }

      return {
        success: true,
        data: data.departments || []
      };
    } catch (error) {
      console.error('Error getting departments:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Gestion des filtres sauvegardés
  saveFilter: async (filterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/filters`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(filterData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde du filtre');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error saving filter:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  getSavedFilters: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/filters`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des filtres');
      }

      return {
        success: true,
        data: data.filters || []
      };
    } catch (error) {
      console.error('Error getting saved filters:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Réinitialiser le mot de passe d'un utilisateur (admin seulement)
  resetPassword: async (userId, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation du mot de passe');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
};

export default userAPI;
