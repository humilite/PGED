import React, { useState, useEffect } from 'react';
import { Users, Folder, FileText, Settings, BarChart3 } from 'lucide-react';
import api from '../../services/authService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    totalClassifications: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Ces appels d'API devraient être implémentés dans le backend
      const [usersRes, docsRes, classificationsRes] = await Promise.all([
        api.get('/admin/users/stats'),
        api.get('/admin/documents/stats'),
        api.get('/admin/classifications/stats')
      ]);

      setStats({
        totalUsers: usersRes.data.total,
        activeUsers: usersRes.data.active,
        totalDocuments: docsRes.data.total,
        totalClassifications: classificationsRes.data.total
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const StatCard = ({ icon, label, value, color }) => {
    const IconComponent = icon;
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${color} mr-4`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              <p className="text-gray-600">
                Gérez les utilisateurs, le plan de classement et les paramètres système
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total utilisateurs"
              value={stats.totalUsers}
              color="bg-blue-500"
            />
            <StatCard
              icon={Users}
              label="Utilisateurs actifs"
              value={stats.activeUsers}
              color="bg-green-500"
            />
            <StatCard
              icon={FileText}
              label="Documents total"
              value={stats.totalDocuments}
              color="bg-purple-500"
            />
            <StatCard
              icon={Folder}
              label="Catégories"
              value={stats.totalClassifications}
              color="bg-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Navigation administration */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Administration</h3>
                </div>
                <nav className="p-4 space-y-2">
                  <a
                    href="/admin/users"
                    className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    <Users className="h-5 w-5" />
                    Utilisateurs
                  </a>
                  <a
                    href="/admin/classifications"
                    className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    <Folder className="h-5 w-5" />
                    Plan de classement
                  </a>
                  <a
                    href="/admin/statistics"
                    className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    <BarChart3 className="h-5 w-5" />
                    Statistiques
                  </a>
                  <a
                    href="/admin/settings"
                    className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    <Settings className="h-5 w-5" />
                    Paramètres
                  </a>
                </nav>
              </div>
            </div>

            {/* Graphiques et activité */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6">
                {/* Activité récente */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Activité récente
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Nouveau document archivé
                          </p>
                          <p className="text-sm text-gray-500">
                            Contrat de formation 2025
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">Il y a 2 min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Nouvel utilisateur
                          </p>
                          <p className="text-sm text-gray-500">
                            Marie Ntoghe
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">Il y a 1h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Utilisation de l'espace */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Utilisation de l'espace
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Espace utilisé</span>
                          <span>2.1 GB / 10 GB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: '21%' }}
                          ></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Documents:</span>
                          <span className="ml-2 font-medium">1,284</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Dernier backup:</span>
                          <span className="ml-2 font-medium">Aujourd'hui 02:00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;