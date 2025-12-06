import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Download, 
  Eye, 
  Search, 
  Filter,
  TrendingUp,
  Users,
  FolderOpen,
  Shield,
  Calendar,
  Hash,
  User,
  RefreshCw,
  AlertCircle,
  Lock,
  Unlock,
  EyeOff,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Database,
  ChevronRight,
  MoreVertical,
  Eye as EyeIcon,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { documentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    documentsApprouves: 0,
    documentsEnAttente: 0,
    documentsRejetes: 0,
    documentsAujourdhui: 0,
    utilisateursActifs: 0,
    stockageUtilise: '0 GB',
    tauxCompletude: 0
  });

  const [documentsRecents, setDocumentsRecents] = useState([]);
  const [confidentialityStats, setConfidentialityStats] = useState([]);
  const [periodStats, setPeriodStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user } = useAuth();

  const COLORS = [
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  ];

  const STATUS_COLORS = {
    'validé': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'approuvé': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'approved': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'en attente': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'pending': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'rejeté': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    'rejected': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  };

  const CONFIDENTIALITY_COLORS = {
    'public': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'interne': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'confidentiel': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'secret': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  };

  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 300000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allDocuments = await documentsAPI.getAll({ limit: 1000 });
      const documents = allDocuments.documents || allDocuments || [];
      
      const recentDocs = await documentsAPI.getAll({ 
        limit: 5, 
        sort: 'created_at:desc' 
      });
      
      const today = new Date().toISOString().split('T')[0];
      const todayCount = documents.filter(doc => {
        const docDate = doc.created_at ? new Date(doc.created_at).toISOString().split('T')[0] : null;
        return docDate === today;
      }).length;
      
      const statusStats = calculateStatusStats(documents);
      const confidentialityStatsData = calculateConfidentialityStats(documents);
      const periodData = calculatePeriodStats(documents, timeRange);
      const storageUsed = calculateStorageUsed(documents);
      const completionRate = calculateCompletionRate(documents);
      const activeUsers = await calculateActiveUsers(documents);
      
      setStats({
        totalDocuments: documents.length,
        documentsApprouves: statusStats.approved,
        documentsEnAttente: statusStats.pending,
        documentsRejetes: statusStats.rejected,
        documentsAujourdhui: todayCount,
        utilisateursActifs: activeUsers,
        stockageUtilise: storageUsed,
        tauxCompletude: completionRate
      });
      
      const processedRecentDocs = processRecentDocuments(
        recentDocs.documents || recentDocs || []
      );
      setDocumentsRecents(processedRecentDocs);
      
      setConfidentialityStats(confidentialityStatsData);
      setPeriodStats(periodData);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setError('Impossible de charger les données. Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatusStats = (documents) => {
    const approved = documents.filter(doc => 
      doc.status === 'validé' || 
      doc.status === 'approuvé' || 
      doc.status === 'approved' ||
      doc.status === 'Validé' ||
      doc.status === 'Approuvé'
    ).length;

    const pending = documents.filter(doc => 
      doc.status === 'en attente' || 
      doc.status === 'pending' ||
      doc.status === 'En attente' ||
      doc.status === 'Pending'
    ).length;

    const rejected = documents.filter(doc => 
      doc.status === 'rejeté' || 
      doc.status === 'rejected' ||
      doc.status === 'Rejeté' ||
      doc.status === 'Rejected'
    ).length;

    return { approved, pending, rejected };
  };

  const calculateConfidentialityStats = (documents) => {
    const confidentialityCount = {};
    
    documents.forEach(doc => {
      const confidentiality = doc.confidentiality_level || doc.confidentiality || 'interne';
      const normalizedConfidentiality = normalizeConfidentiality(confidentiality);
      confidentialityCount[normalizedConfidentiality] = (confidentialityCount[normalizedConfidentiality] || 0) + 1;
    });
    
    const confidentialityOrder = {
      'public': 1,
      'interne': 2,
      'confidentiel': 3,
      'secret': 4
    };
    
    return Object.entries(confidentialityCount)
      .map(([name, value]) => ({ 
        name: getConfidentialityLabel(name),
        value,
        level: name
      }))
      .sort((a, b) => {
        const orderA = confidentialityOrder[a.level] || 99;
        const orderB = confidentialityOrder[b.level] || 99;
        return orderA - orderB;
      });
  };

  const normalizeConfidentiality = (level) => {
    if (!level) return 'interne';
    
    const levelLower = level.toLowerCase();
    if (levelLower.includes('public')) return 'public';
    if (levelLower.includes('interne') || levelLower.includes('internal')) return 'interne';
    if (levelLower.includes('confidentiel') || levelLower.includes('confidential')) return 'confidentiel';
    if (levelLower.includes('secret')) return 'secret';
    return 'interne';
  };

  const getConfidentialityLabel = (level) => {
    const levelMap = {
      'public': 'Public',
      'interne': 'Interne',
      'internal': 'Interne',
      'confidentiel': 'Confidentiel',
      'confidential': 'Confidentiel',
      'secret': 'Secret'
    };
    return levelMap[level] || level;
  };

  const getConfidentialityIcon = (level) => {
    switch(level) {
      case 'public':
        return <Unlock className="h-4 w-4 text-white" />;
      case 'interne':
      case 'internal':
        return <EyeIcon className="h-4 w-4 text-white" />;
      case 'confidentiel':
      case 'confidential':
        return <Lock className="h-4 w-4 text-white" />;
      case 'secret':
        return <EyeOff className="h-4 w-4 text-white" />;
      default:
        return <Shield className="h-4 w-4 text-white" />;
    }
  };

  const getConfidentialityColor = (level) => {
    const normalizedLevel = normalizeConfidentiality(level);
    return CONFIDENTIALITY_COLORS[normalizedLevel] || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
  };

  const calculatePeriodStats = (documents, range) => {
    const now = new Date();
    let days = 7;
    
    switch(range) {
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '1y': days = 365; break;
      default: days = 7;
    }
    
    const displayDays = Math.min(days, 30);
    const stats = {};
    
    for (let i = displayDays - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      stats[dateStr] = 0;
    }
    
    documents.forEach(doc => {
      if (doc.created_at) {
        const docDate = new Date(doc.created_at).toISOString().split('T')[0];
        if (stats[docDate] !== undefined) {
          stats[docDate]++;
        }
      }
    });
    
    return Object.entries(stats).map(([date, count]) => {
      const dateObj = new Date(date);
      let name;
      
      if (displayDays <= 7) {
        name = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' });
      } else if (displayDays <= 30) {
        name = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      } else {
        name = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
      }
      
      return {
        name,
        documents: count,
        date
      };
    });
  };

  const calculateStorageUsed = (documents) => {
    const totalBytes = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
    return formatFileSize(totalBytes);
  };

  const calculateCompletionRate = (documents) => {
    if (documents.length === 0) return 0;
    
    const completedDocs = documents.filter(doc => {
      const hasTitle = doc.title && doc.title.trim() !== '';
      const hasIndex = doc.index_alphanum && doc.index_alphanum.trim() !== '';
      const hasClassification = doc.classification && doc.classification.trim() !== '';
      const hasFile = doc.file_name || doc.original_filename;
      
      return hasTitle && hasIndex && hasClassification && hasFile;
    }).length;
    
    return Math.round((completedDocs / documents.length) * 100);
  };

  const calculateActiveUsers = async (documents) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentAuthors = documents
        .filter(doc => {
          if (!doc.created_at) return false;
          const docDate = new Date(doc.created_at);
          return docDate >= sevenDaysAgo;
        })
        .map(doc => doc.user_id || doc.author)
        .filter((value, index, self) => value && self.indexOf(value) === index);
      
      return Math.max(recentAuthors.length, 1);
    } catch (error) {
      return 1;
    }
  };

  const processRecentDocuments = (documents) => {
    return documents.slice(0, 5).map(doc => ({
      id: doc.id || doc._id,
      title: doc.title || 'Document sans titre',
      author: getAuthorDisplayName(doc),
      status: doc.status || 'inconnu',
      date: doc.created_at || doc.updated_at || new Date().toISOString(),
      confidentiality: doc.confidentiality_level || doc.confidentiality || 'interne',
      index_alphanum: doc.index_alphanum || 'Non généré',
      file_name: doc.file_name || doc.original_filename
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAuthorDisplayName = (doc) => {
    if (doc.author && doc.author !== 'Non spécifié' && doc.author.trim() !== '') {
      return doc.author;
    }
    
    if (doc.first_name && doc.last_name) {
      return `${doc.first_name} ${doc.last_name}`;
    }
    
    if (doc.user_name) {
      return doc.user_name;
    }
    
    if (doc.user_email) {
      return doc.user_email.split('@')[0];
    }
    
    if (user && doc.user_id === user.id) {
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      }
      if (user.name) {
        return user.name;
      }
      if (user.email) {
        return user.email.split('@')[0];
      }
    }
    
    return 'Auteur non spécifié';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    
    if (statusLower.includes('validé') || statusLower.includes('approuvé') || statusLower.includes('approved')) {
      return 'bg-linear-to-r from-green-500/10 to-emerald-500/10 text-green-700 border border-green-200/50';
    } else if (statusLower.includes('en attente') || statusLower.includes('pending')) {
      return 'bg-linear-to-r from-yellow-500/10 to-amber-500/10 text-amber-700 border border-yellow-200/50';
    } else if (statusLower.includes('rejeté') || statusLower.includes('rejected')) {
      return 'bg-linear-to-r from-red-500/10 to-rose-500/10 text-rose-700 border border-red-200/50';
    } else if (statusLower.includes('draft') || statusLower.includes('brouillon')) {
      return 'bg-linear-to-r from-gray-500/10 to-slate-500/10 text-gray-700 border border-gray-200/50';
    } else {
      return 'bg-linear-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-200/50';
    }
  };

  const getStatusText = (status) => {
    const statusLower = (status || '').toLowerCase();
    
    if (statusLower.includes('validé') || statusLower.includes('approuvé') || statusLower.includes('approved')) {
      return 'Validé';
    } else if (statusLower.includes('en attente') || statusLower.includes('pending')) {
      return 'En attente';
    } else if (statusLower.includes('rejeté') || statusLower.includes('rejected')) {
      return 'Rejeté';
    } else if (statusLower.includes('draft') || statusLower.includes('brouillon')) {
      return 'Brouillon';
    } else {
      return status || 'Inconnu';
    }
  };

  const StatCard = ({ title, value, icon, color, trend, description }) => {
    const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : null;
    
    return (
      <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-gray-300/50">
        <div className="absolute inset-0 bg-linear-to-br from-white to-gray-50/50 rounded-2xl -z-10" />
        
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className={`p-3 rounded-xl ${color} shadow-lg`}>
              {icon}
            </div>
            {trend !== 0 && (
              <div className={`absolute -top-2 -right-2 flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <TrendIcon className="h-3 w-3 mr-1" />
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-100/50 rounded-lg transition-opacity">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-2 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              {description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderPieChartData = () => {
    const total = stats.documentsApprouves + stats.documentsEnAttente + stats.documentsRejetes;
    
    if (total === 0) {
      return [{ name: 'Aucun document', value: 1 }];
    }
    
    return [
      { name: 'Approuvés', value: stats.documentsApprouves },
      { name: 'En attente', value: stats.documentsEnAttente },
      { name: 'Rejetés', value: stats.documentsRejetes }
    ].filter(item => item.value > 0);
  };

  const renderConfidentialityPieChartData = () => {
    const total = confidentialityStats.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
      return [{ name: 'Aucun document', value: 1 }];
    }
    
    return confidentialityStats.map(item => ({
      name: item.name,
      value: item.value,
      level: item.level
    })).filter(item => item.value > 0);
  };

  if (loading && !lastUpdated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Chargement du tableau de bord...</p>
          <p className="text-sm text-gray-500 mt-2">Analyse des documents en cours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100/50">
      {/* Header avec gradient */}
      <div className="relative bg-linear-to-r from-blue-600 via-blue-500 to-cyan-500 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Tableau de bord</h1>
                  <p className="text-blue-100 mt-1">Vue d'ensemble des documents et statistiques en temps réel</p>
                </div>
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-blue-100/80">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-white border-none outline-none px-3 py-2 text-sm focus:ring-0"
                >
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">90 derniers jours</option>
                  <option value="1y">1 an</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={loadDashboardData}
                  disabled={loading}
                  className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Actualiser"
                >
                  <RefreshCw className={`h-4 w-4 text-white ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                <button className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <Download className="h-4 w-4" />
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-gray-50/0 to-gray-50" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 -mt-4 relative z-10">
        {error && (
          <div className="mb-8 bg-linear-to-r from-red-500/10 to-rose-500/10 backdrop-blur-sm border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-700">{error}</p>
              <button 
                onClick={loadDashboardData}
                className="text-red-600 hover:text-red-800 text-sm font-medium mt-1 flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Statistiques Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Documents"
            value={stats.totalDocuments.toLocaleString('fr-FR')}
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            color="bg-linear-to-br from-blue-100 to-blue-200"
            trend={12}
            description="Tous les documents système"
          />
          
          <StatCard
            title="Documents Aujourd'hui"
            value={stats.documentsAujourdhui}
            icon={<Calendar className="h-6 w-6 text-purple-600" />}
            color="bg-linear-to-br from-purple-100 to-purple-200"
            trend={24}
            description="Ajoutés aujourd'hui"
          />
        
          <StatCard
            title="Utilisateurs Actifs"
            value={stats.utilisateursActifs}
            icon={<Users className="h-6 w-6 text-teal-600" />}
            color="bg-linear-to-br from-teal-100 to-teal-200"
            trend={15}
            description="Connectés cette semaine"
          />
          
          <StatCard
            title="Stockage Utilisé"
            value={stats.stockageUtilise}
            icon={<FolderOpen className="h-6 w-6 text-orange-600" />}
            color="bg-linear-to-br from-orange-100 to-orange-200"
            trend={18}
            description="Espace de stockage total"
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique d'activité */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-blue-500/10 to-blue-600/10 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Activité Hebdomadaire</h3>
                  <p className="text-sm text-gray-500">
                    {timeRange === '7d' ? '7 jours' : timeRange === '30d' ? '30 jours' : '90 jours'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs font-medium text-gray-600">Documents</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={periodStats.slice(-7)}>
                  <defs>
                    <linearGradient id="colorDocuments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280" 
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} documents`, 'Quantité']}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="documents" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#colorDocuments)"
                    fillOpacity={1}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="documents" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ 
                      fill: '#3b82f6', 
                      strokeWidth: 2, 
                      r: 4,
                      stroke: '#ffffff'
                    }}
                    activeDot={{ 
                      r: 6, 
                      strokeWidth: 2,
                      stroke: '#ffffff'
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Répartition par confidentialité */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-purple-500/10 to-purple-600/10 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Répartition par Confidentialité</h3>
                  <p className="text-sm text-gray-500">Niveaux de sécurité des documents</p>
                </div>
              </div>
              <PieChartIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={renderConfidentialityPieChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                  >
                    {renderConfidentialityPieChartData().map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#confidentiality-${index})`} 
                      />
                    ))}
                  </Pie>
                  <defs>
                    {renderConfidentialityPieChartData().map((entry, index) => (
                      <linearGradient key={index} id={`confidentiality-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={getConfidentialityColor(entry.level).match(/#[a-fA-F0-9]{6}/g)?.[0] || '#3b82f6'} />
                        <stop offset="100%" stopColor={getConfidentialityColor(entry.level).match(/#[a-fA-F0-9]{6}/g)?.[1] || '#2563eb'} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Tooltip 
                    formatter={(value) => [`${value} documents`, 'Quantité']}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {confidentialityStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-linear-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        background: getConfidentialityColor(item.level)
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Récents */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 mb-8">
          <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-green-500/10 to-green-600/10 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Documents Récents</h3>
                <p className="text-sm text-gray-500">Les 5 derniers documents ajoutés</p>
              </div>
            </div>
            <Link
              to="/documents"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group"
            >
              Voir tous
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-gray-50 to-gray-100/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Index
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Auteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Confidentialité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {documentsRecents.length > 0 ? (
                  documentsRecents.map((doc, index) => {
                    const confidentialityLevel = normalizeConfidentiality(doc.confidentiality);
                    const confidentialityLabel = getConfidentialityLabel(confidentialityLevel);
                    const confidentialityColor = getConfidentialityColor(confidentialityLevel);
                    
                    return (
                      <tr 
                        key={doc.id} 
                        className="group hover:bg-linear-to-r hover:from-gray-50/50 hover:to-white transition-all duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg mr-3">
                              <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                            </div>
                            <div className="text-sm font-mono font-semibold text-gray-900">
                              {doc.index_alphanum || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-linear-to-br from-blue-100 to-blue-200 rounded-lg mr-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {doc.title}
                              </p>
                              <p className="text-xs text-gray-500">ID: {doc.id?.toString().padStart(6, '0')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="w-10 h-10 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                                {doc.author?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.author}</p>
                              <p className="text-xs text-gray-500">Auteur</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ 
                                background: getConfidentialityColor(confidentialityLevel),
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              {getConfidentialityIcon(confidentialityLevel)}
                            </div>
                            <span 
                              className="font-semibold text-sm px-3 py-1.5 rounded-full"
                              style={{ 
                                background: `${confidentialityColor.match(/#[a-fA-F0-9]{6}/g)?.[0] || '#3b82f6'}20`,
                                color: confidentialityColor.match(/#[a-fA-F0-9]{6}/g)?.[0] || '#3b82f6'
                              }}
                            >
                              {confidentialityLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(doc.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(doc.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/documents/${doc.id}`}
                              className="p-2 bg-linear-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                              title="Voir le document"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button 
                              className="p-2 bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                              title="Télécharger"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `/api/documents/${doc.id}/download`;
                                link.download = doc.file_name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="inline-flex p-4 bg-linear-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun document récent
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Commencez par uploader votre premier document
                      </p>
                      <Link
                        to="/upload"
                        className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                      >
                        <Upload className="h-4 w-4" />
                        Uploader un document
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200/50 bg-linear-to-r from-gray-50/50 to-gray-100/50">
            <Link
              to="/upload"
              className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-2 transition-colors group"
            >
              <div className="p-1.5 bg-linear-to-br from-green-100 to-green-200 rounded-lg">
                <Download className="h-4 w-4" />
              </div>
              <span className="group-hover:underline">Ajouter un nouveau document</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Informations système */}
        <div className="bg-linear-to-r from-blue-600/5 to-cyan-500/5 backdrop-blur-sm rounded-2xl border border-blue-200/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-linear-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Système de Gestion Électronique de Documents</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Basé sur {stats.totalDocuments} documents • Version 2.0 • Données actualisées en temps réel
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Composant Upload manquant pour le bouton
const Upload = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export default Dashboard;