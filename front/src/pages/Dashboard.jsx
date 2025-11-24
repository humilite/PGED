import React, { useState, useEffect } from 'react';
import { FileText, Upload, Search, Users } from 'lucide-react';
import api from '../services/authService';

// ❌ Supprimez l'interface TypeScript
// interface DashboardStats {
//   totalDocuments: number;
//   myDocuments: number;
//   recentDocuments: any[];
// }

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    myDocuments: 0,
    recentDocuments: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const StatCard = ({ icon, label, value, description }) => {
    const IconComponent = icon;
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <IconComponent className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600 mb-8">
          Bienvenue dans votre système de gestion électronique de documents
        </p>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Documents totaux"
            value={stats.totalDocuments}
          />
          <StatCard
            icon={FileText}
            label="Mes documents"
            value={stats.myDocuments}
          />
          <StatCard
            icon={Upload}
            label="À archiver"
            value="12"
            description="En attente de classement"
          />
          <StatCard
            icon={Users}
            label="Utilisateurs actifs"
            value="24"
          />
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Nouveau document</span>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Search className="h-5 w-5 text-green-600" />
              <span className="font-medium">Rechercher</span>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Voir mes documents</span>
            </button>
          </div>
        </div>

        {/* Documents récents */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Documents récents</h2>
          </div>
          <div className="p-6">
            {stats.recentDocuments && stats.recentDocuments.length > 0 ? (
              <div className="space-y-4">
                {stats.recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">{doc.index_alphanum}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucun document récent
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;