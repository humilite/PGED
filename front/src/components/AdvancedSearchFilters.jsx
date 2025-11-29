import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  Calendar,
  ChevronDown,
  Save,
  RotateCcw
} from 'lucide-react';
import userAPI from '../services/userAPI';

const AdvancedSearchFilters = ({
  onFiltersChange,
  onSortChange,
  currentFilters = {},
  currentSort = { field: 'created_at', order: 'DESC' }
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    search: currentFilters.search || '',
    role: currentFilters.role || 'all',
    department: currentFilters.department || 'all',
    status: currentFilters.status || 'all',
    dateFrom: currentFilters.dateFrom || '',
    dateTo: currentFilters.dateTo || ''
  });
  const [sort, setSort] = useState(currentSort);
  const [savedFilters, setSavedFilters] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Charger les départements disponibles
  useEffect(() => {
    loadDepartments();
    loadSavedFilters();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await userAPI.getDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement départements:', error);
    }
  };

  const loadSavedFilters = async () => {
    try {
      // TODO: Implémenter l'API pour récupérer les filtres sauvegardés
      // const response = await userAPI.getSavedFilters();
      // setSavedFilters(response.data || []);
    } catch (error) {
      console.error('Erreur chargement filtres sauvegardés:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (field, order) => {
    const newSort = { field, order };
    setSort(newSort);
    onSortChange(newSort);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      role: 'all',
      department: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const saveFilter = async () => {
    if (!filterName.trim()) return;

    try {
      // TODO: Implémenter l'API pour sauvegarder les filtres
      // await userAPI.saveFilter({ name: filterName, filters, sort });
      setShowSaveDialog(false);
      setFilterName('');
      loadSavedFilters(); // Recharger la liste
    } catch (error) {
      console.error('Erreur sauvegarde filtre:', error);
    }
  };

  const loadFilter = (filter) => {
    setFilters(filter.filters);
    setSort(filter.sort);
    onFiltersChange(filter.filters);
    onSortChange(filter.sort);
  };

  const hasActiveFilters = () => {
    return filters.search ||
           filters.role !== 'all' ||
           filters.department !== 'all' ||
           filters.status !== 'all' ||
           filters.dateFrom ||
           filters.dateTo;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Barre de recherche principale */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              isExpanded
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres avancés
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
            >
              <RotateCcw className="w-4 h-4" />
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Filtres avancés (dépliables) */}
      {isExpanded && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Filtre par rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Administrateur</option>
                <option value="gestionnaire">Gestionnaire</option>
                <option value="user">Utilisateur</option>
              </select>
            </div>

            {/* Filtre par département */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les départements</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Filtre par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                value={`${sort.field}_${sort.order}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('_');
                  handleSortChange(field, order);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at_DESC">Date de création (récent)</option>
                <option value="created_at_ASC">Date de création (ancien)</option>
                <option value="first_name_ASC">Prénom (A-Z)</option>
                <option value="first_name_DESC">Prénom (Z-A)</option>
                <option value="last_name_ASC">Nom (A-Z)</option>
                <option value="last_name_DESC">Nom (Z-A)</option>
                <option value="email_ASC">Email (A-Z)</option>
                <option value="email_DESC">Email (Z-A)</option>
                <option value="last_login_DESC">Dernière connexion</option>
              </select>
            </div>
          </div>

          {/* Filtres de date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de création (de)
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de création (à)
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions des filtres */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Sauvegarder ce filtre
              </button>

              {savedFilters.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const filter = savedFilters.find(f => f.id === parseInt(e.target.value));
                      if (filter) loadFilter(filter);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Charger un filtre...</option>
                  {savedFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>{filter.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="text-sm text-gray-500">
              {hasActiveFilters() && (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Filtres actifs
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de sauvegarde de filtre */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sauvegarder le filtre
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du filtre
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Ex: Utilisateurs actifs RH"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setFilterName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveFilter}
                  disabled={!filterName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchFilters;
