import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const documentsAPI = {
  // Récupérer tous les documents
  getAll: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  // Récupérer un document par ID
  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Créer un nouveau document
  create: async (documentData) => {
    const response = await api.post('/documents', documentData);
    return response.data;
  },

  // Mettre à jour un document
  update: async (id, documentData) => {
    const response = await api.put(`/documents/${id}`, documentData);
    return response.data;
  },

  // Supprimer un document
  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },

  // Télécharger un document
  download: async (id) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Récupérer les statistiques
  getStats: async () => {
    const response = await api.get('/documents/stats');
    return response.data;
  },

  // Approuver un document
  approve: async (id) => {
    const response = await api.patch(`/documents/${id}/approve`);
    return response.data;
  },

  // Rejeter un document
  reject: async (id, reason) => {
    const response = await api.patch(`/documents/${id}/reject`, { reason });
    return response.data;
  }
};

export const authAPI = {
  // Connexion
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Rafraîchir le token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

export const usersAPI = {
  // Récupérer tous les utilisateurs
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Créer un utilisateur
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Supprimer un utilisateur
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default api;