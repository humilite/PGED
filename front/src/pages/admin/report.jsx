import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Users, 
  FileText, 
  TrendingUp,
  Filter
} from 'lucide-react';
import api from '../../services/authService';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: 'month',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReportData();
  }, [filters.period]);

  const fetchReportData = async () => {
    try {
      // Simuler des données de rapport (à remplacer par des appels API réels)
      const mockData = {
        period: filters.period,
        documentsAdded: 124,
        usersActive: 18,
        storageUsed: 2.1,
        topClassifications: [
          { name: 'RH-DOS Dossiers Personnel', count: 567 },
          { name: 'RH-CTR Contrats', count: 234 },
          { name: 'RH-RAP Rapports', count: 123 },
          { name: 'RH-POL Politiques', count: 45 }
        ],
        userActivity: [
          { date: '2025-01-01', count: 45 },
          { date: '2025-01-02', count: 67 },
          { date: '2025-01-03', count: 89 },
          { date: '2025-01-04', count: 56 },
          { date: '2025-01-05', count: 78 },
          { date: '2025-01-06', count: 92 },
          { date: '2025-01-07', count: 101 }
        ]
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format) => {
    // Implémenter l'export selon le format
    alert(`Export ${format} en cours de développement...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Fonction utilitaire pour calculer le pourcentage de largeur
  const calculateWidthPercentage = (count, dataArray) => {
    const maxCount = Math.max(...dataArray.map(item => item.count));
    return (count / maxCount) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rapports et statistiques</h1>
              <p className="text-gray-600">Analyse détaillée de l'utilisation de la plateforme</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filters.period}
                onChange={(e) => setFilters({...filters, period: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
              
              <button
                onClick={() => exportReport('pdf')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                <Download className="h-4 w-4" />
                Exporter PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Cartes de statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents ajoutés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData?.documentsAdded}
                  </p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +12% vs période précédente
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData?.usersActive}
                  </p>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +8% vs période précédente
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Stockage utilisé</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData?.storageUsed} GB
                  </p>
                  <p className="text-sm text-gray-600">
                    21% de la capacité totale
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classifications populaires */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Top des classifications
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {reportData?.topClassifications.map((classification, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {classification.name}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${calculateWidthPercentage(classification.count, reportData.topClassifications)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 ml-4">
                        {classification.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activité des utilisateurs */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Activité des utilisateurs (7 jours)
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {reportData?.userActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(activity.date).toLocaleDateString('fr-FR', { 
                          weekday: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full" 
                            style={{ 
                              width: `${calculateWidthPercentage(activity.count, reportData.userActivity)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">
                          {activity.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Détail par utilisateur
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière activité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Marie Ntoghe
                        </div>
                        <div className="text-sm text-gray-500">
                          marie.ntoghe@dgrh.gov.ga
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">158</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      15 Jan 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Actif
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Jean Mba
                        </div>
                        <div className="text-sm text-gray-500">
                          jean.mba@dgrh.gov.ga
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">89</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      16 Jan 2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Actif
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;