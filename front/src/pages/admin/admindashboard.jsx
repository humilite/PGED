import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Folder, 
  FileText, 
  Settings, 
  BarChart3, 
  Calendar,
  HardDrive,
  RefreshCw,
  UserPlus,
  Upload,
  Archive
} from 'lucide-react';
import api from '../../services/authService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    totalClassifications: 0,
    storageUsed: 0,
    storageLimit: 10240, // 10 GB en MB
    storagePercentage: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des données du dashboard...');

      // Appel pour les statistiques principales
      const statsResponse = await api.get('/admin/stats');
      
      // Appels pour les données dynamiques supplémentaires
      const [activityResponse, storageResponse] = await Promise.all([
        api.get('/admin/recent-activity').catch(() => ({ data: { recentActivity: [] } })), // Fallback si l'endpoint n'existe pas
        api.get('/admin/storage-usage').catch(() => ({ data: { storage: { used: 0, limit: 10240, percentage: 0 } } })) // Fallback
      ]);

      console.log('📊 Données reçues:', {
        stats: statsResponse.data,
        activity: activityResponse.data,
        storage: storageResponse.data
      });

      // Mettre à jour les statistiques principales
      if (statsResponse.data) {
        setStats(prev => ({
          ...prev,
          totalUsers: statsResponse.data.users?.total_users || 0,
          activeUsers: statsResponse.data.users?.active_users || 0,
          totalDocuments: statsResponse.data.documents?.total || 0,
          totalClassifications: statsResponse.data.classifications?.total || 0
        }));
      }

      // Mettre à jour l'activité récente
      const activityData = activityResponse.data;
      if (activityData?.recentActivity) {
        setRecentActivity(activityData.recentActivity);
      } else if (activityData?.data) {
        setRecentActivity(activityData.data);
      } else {
        // Données de démonstration si l'API n'est pas disponible
        setRecentActivity([
          {
            id: 1,
            type: 'document',
            title: 'Rapport trimestriel',
            description: 'Document archivé par le système',
            user: 'Système',
            timestamp: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
          },
          {
            id: 2,
            type: 'user',
            title: 'Nouvelle connexion',
            description: 'Administrateur connecté',
            user: 'Admin System',
            timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
          },
          {
            id: 3,
            type: 'upload',
            title: 'Document téléchargé',
            description: 'Contrat de partenariat',
            user: 'Utilisateur',
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          }
        ]);
      }

      // Mettre à jour l'utilisation du stockage
      const storageData = storageResponse.data;
      if (storageData?.storage) {
        setStats(prev => ({
          ...prev,
          storageUsed: storageData.storage.used || 0,
          storageLimit: storageData.storage.limit || 10240,
          storagePercentage: storageData.storage.percentage || 0
        }));
      } else if (storageData?.data) {
        setStats(prev => ({
          ...prev,
          storageUsed: storageData.data.used || 0,
          storageLimit: storageData.data.limit || 10240,
          storagePercentage: storageData.data.percentage || 0
        }));
      } else {
        // Calcul basé sur les documents si l'API n'est pas disponible
        const estimatedStorage = (statsResponse.data.documents?.total || 0) * 2.5; // Estimation 2.5MB par document
        const percentage = Math.min((estimatedStorage / 10240) * 100, 100);
        
        setStats(prev => ({
          ...prev,
          storageUsed: Math.round(estimatedStorage),
          storagePercentage: Math.round(percentage)
        }));
      }

      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
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
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '...' : value}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Fonction pour formater la date relative
  const getTimeAgo = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} j`;
      
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date inconnue';
    }
  };

  // Fonction pour obtenir l'icône selon le type d'activité
  const getActivityIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'user':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'upload':
        return <Upload className="w-4 h-4 text-purple-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  // Fonction pour formater la taille de stockage
  const formatStorageSize = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${Math.round(mb)} MB`;
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
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
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
                  <Link
                    to="/admin/users"
                    className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                  >
                    <Users className="h-5 w-5" />
                    Utilisateurs
                  </Link>
                  <Link
                    to="/admin/classifications"
                    className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                  >
                    <Folder className="h-5 w-5" />
                    Plan de classement
                  </Link>
                  <Link
                    to="/admin/statistics"
                    className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                  >
                    <BarChart3 className="h-5 w-5" />
                    Statistiques
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    Paramètres
                  </Link>
                </nav>
              </div>
            </div>

            {/* Graphiques et activité */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-6">
                {/* Activité récente */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        Activité récente
                      </h3>
                      {lastUpdate && (
                        <span className="text-sm text-gray-500">
                          MAJ: {lastUpdate.toLocaleTimeString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getActivityIcon(activity.type)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {activity.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {activity.description || activity.user}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {getTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune activité récente</p>
                      </div>
                    )}
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
                          <span>
                            {formatStorageSize(stats.storageUsed)} / {formatStorageSize(stats.storageLimit)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stats.storagePercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{stats.storagePercentage}% utilisé</span>
                          <span>{formatStorageSize(stats.storageLimit - stats.storageUsed)} disponible</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <HardDrive className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <span className="text-gray-600">Documents:</span>
                            <span className="ml-2 font-medium">{stats.totalDocuments}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <span className="text-gray-600">Dernière MAJ:</span>
                            <span className="ml-2 font-medium">
                              {lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : '--:--'}
                            </span>
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
    </div>
  );
};

export default AdminDashboard;