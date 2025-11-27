import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
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

  // Données mock pour les graphiques
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

  const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulation de données ou appel API réel
      const documentsData = await documentsAPI.getStats();
      
      setStats({
        totalDocuments: documentsData.total || 156,
        documentsApprouves: documentsData.approved || 102,
        documentsEnAttente: documentsData.pending || 31,
        documentsRejetes: documentsData.rejected || 23
      });
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      // Données par défaut en cas d'erreur
      setStats({
        totalDocuments: 156,
        documentsApprouves: 102,
        documentsEnAttente: 31,
        documentsRejetes: 23
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Tableau de Bord PGED
        </h1>
        <p className="text-gray-600 text-lg">
          Vue d'ensemble des documents et statistiques
        </p>
      </header>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Carte Total Documents */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
            📊
          </div>
          <div className="flex-1">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Documents</h3>
            <p className="text-2xl font-bold text-gray-800 mb-1">{stats.totalDocuments}</p>
            <span className="text-sm text-gray-500">+12% ce mois</span>
          </div>
        </div>

        {/* Carte Documents Approuvés */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
            ✅
          </div>
          <div className="flex-1">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Documents Approuvés</h3>
            <p className="text-2xl font-bold text-gray-800 mb-1">{stats.documentsApprouves}</p>
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
        </div>

        {/* Carte En Attente */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
            ⏳
          </div>
          <div className="flex-1">
            <h3 className="text-gray-500 text-sm font-medium mb-1">En Attente</h3>
            <p className="text-2xl font-bold text-gray-800 mb-1">{stats.documentsEnAttente}</p>
            <span className="text-sm text-yellow-600 font-medium">-5%</span>
          </div>
        </div>

        {/* Carte Documents Rejetés */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl">
            ❌
          </div>
          <div className="flex-1">
            <h3 className="text-gray-500 text-sm font-medium mb-1">Documents Rejetés</h3>
            <p className="text-2xl font-bold text-gray-800 mb-1">{stats.documentsRejetes}</p>
            <span className="text-sm text-red-600 font-medium">+3%</span>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graphique en barres - Évolution mensuelle */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Évolution Mensuelle des Documents
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataBar}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="documents" fill="#8884d8" name="Documents" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique circulaire - Répartition */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Répartition des Documents
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques pleine largeur */}
      <div className="grid grid-cols-1 gap-6">
        {/* Graphique linéaire - Demandes hebdomadaires */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Demandes Hebdomadaires
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataLine}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="demandes" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Nombre de demandes"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique aires - Tendances */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Tendances des Documents Traités
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dataBar}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="documents" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
                name="Documents traités"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;