import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
  LineChart, Line,
  ResponsiveContainer
} from 'recharts';
import { documentsAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    documentsApprouves: 0,
    documentsEnAttente: 0,
    documentsRejetes: 0
  });

  const [loading, setLoading] = useState(true);

  const dataBar = [
    { name: 'Jan', documents: 45 },
    { name: 'Fév', documents: 52 },
    { name: 'Mar', documents: 38 },
    { name: 'Avr', documents: 67 },
    { name: 'Mai', documents: 59 },
    { name: 'Jun', documents: 72 }
  ];

  const dataPie = [
    { name: 'Approuvés', value: 65 },
    { name: 'En attente', value: 20 },
    { name: 'Rejetés', value: 15 }
  ];

  const dataLine = [
    { name: 'Lun', demandes: 12 },
    { name: 'Mar', demandes: 18 },
    { name: 'Mer', demandes: 8 },
    { name: 'Jeu', demandes: 15 },
    { name: 'Ven', demandes: 22 },
    { name: 'Sam', demandes: 5 },
    { name: 'Dim', demandes: 3 }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const documentsData = await documentsAPI.getStats();

      // Utiliser les données réelles ou des valeurs par défaut si non disponibles
      setStats({
        totalDocuments: documentsData.totalDocuments || 0,
        documentsApprouves: documentsData.documentsApprouves || 0,
        documentsEnAttente: documentsData.documentsEnAttente || 0,
        documentsRejetes: documentsData.documentsRejetes || 0
      });
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);

      // En cas d'erreur, afficher un message d'erreur à l'utilisateur
      setStats({
        totalDocuments: 0,
        documentsApprouves: 0,
        documentsEnAttente: 0,
        documentsRejetes: 0
      });

      // Afficher une notification d'erreur
      alert('Erreur lors du chargement des statistiques. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Tableau de Bord PGED
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble des documents et statistiques
        </p>
      </header>

      {/* Cartes de statistiques - 4 colonnes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Documents</h3>
              <p className="text-xl font-bold text-gray-900">{stats.totalDocuments}</p>
              <span className="text-xs text-gray-500">+12% ce mois</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Approuvés</h3>
              <p className="text-xl font-bold text-gray-900">{stats.documentsApprouves}</p>
              <span className="text-xs text-green-600 font-medium">+8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">En Attente</h3>
              <p className="text-xl font-bold text-gray-900">{stats.documentsEnAttente}</p>
              <span className="text-xs text-yellow-600 font-medium">-5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">❌</span>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Rejetés</h3>
              <p className="text-xl font-bold text-gray-900">{stats.documentsRejetes}</p>
              <span className="text-xs text-red-600 font-medium">+3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques - 2 colonnes côte à côte */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Graphique barres */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Évolution Mensuelle des Documents
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Bar dataKey="documents" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique circulaire */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Répartition des Documents
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {dataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique linéaire - pleine largeur */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Demandes Hebdomadaires
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dataLine}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="demandes" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;