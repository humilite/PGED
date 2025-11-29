import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Users,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import userAPI from '../services/userAPI';

const BulkOperationsToolbar = ({
  selectedUsers,
  onSelectionChange,
  onBulkOperation,
  totalUsers,
  currentFilters
}) => {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkOperation, setBulkOperation] = useState(null);
  const [operationData, setOperationData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleSelectAll = () => {
    if (selectedUsers.length === totalUsers) {
      onSelectionChange([]);
    } else {
      // TODO: Implémenter la sélection de tous les utilisateurs filtrés
      // Pour l'instant, on simule avec un message
      alert('Fonctionnalité de sélection globale à implémenter');
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedUsers.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await userAPI.bulkUpdate(selectedUsers, operationData);
      if (response.success) {
        setResults({
          success: true,
          message: `${selectedUsers.length} utilisateur(s) mis à jour avec succès`,
          data: response.data
        });
        onBulkOperation('update', selectedUsers, operationData);
        onSelectionChange([]);
      } else {
        setResults({
          success: false,
          message: response.error || 'Erreur lors de la mise à jour'
        });
      }
    } catch (error) {
      setResults({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await userAPI.bulkDelete(selectedUsers);
      if (response.success) {
        setResults({
          success: true,
          message: `${selectedUsers.length} utilisateur(s) supprimé(s) avec succès`,
          data: response.data
        });
        onBulkOperation('delete', selectedUsers);
        onSelectionChange([]);
      } else {
        setResults({
          success: false,
          message: response.error || 'Erreur lors de la suppression'
        });
      }
    } catch (error) {
      setResults({
        success: false,
        message: error.message || 'Erreur lors de la suppression'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const executeBulkOperation = () => {
    switch (bulkOperation) {
      case 'update':
        handleBulkUpdate();
        break;
      case 'delete':
        handleBulkDelete();
        break;
      default:
        break;
    }
  };

  const openBulkModal = (operation) => {
    setBulkOperation(operation);
    setOperationData({});
    setResults(null);
    setShowBulkModal(true);
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setBulkOperation(null);
    setOperationData({});
    setResults(null);
  };

  if (selectedUsers.length === 0) {
    return null;
  }

  return (
    <>
      {/* Barre d'outils pour opérations en masse */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                {selectedUsers.length === totalUsers ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {selectedUsers.length === totalUsers ? 'Tout désélectionner' : 'Tout sélectionner'}
                </span>
              </button>
            </div>

            <div className="text-sm text-blue-700 font-medium">
              {selectedUsers.length} utilisateur(s) sélectionné(s)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openBulkModal('update')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier en masse
            </button>

            <button
              onClick={() => openBulkModal('delete')}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'opération en masse */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {bulkOperation === 'update' ? 'Modifier en masse' : 'Supprimer en masse'}
                </h3>
                <button
                  onClick={closeBulkModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {bulkOperation === 'update' && (
                <div className="space-y-4 mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          Modification en masse
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Les champs laissés vides ne seront pas modifiés. Cette action affectera {selectedUsers.length} utilisateur(s).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau rôle
                      </label>
                      <select
                        value={operationData.role || ''}
                        onChange={(e) => setOperationData({...operationData, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Ne pas changer</option>
                        <option value="admin">Administrateur</option>
                        <option value="gestionnaire">Gestionnaire</option>
                        <option value="user">Utilisateur</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau département
                      </label>
                      <input
                        type="text"
                        value={operationData.department || ''}
                        onChange={(e) => setOperationData({...operationData, department: e.target.value})}
                        placeholder="Ne pas changer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statut
                      </label>
                      <select
                        value={operationData.is_active !== undefined ? operationData.is_active.toString() : ''}
                        onChange={(e) => setOperationData({
                          ...operationData,
                          is_active: e.target.value === '' ? undefined : e.target.value === 'true'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Ne pas changer</option>
                        <option value="true">Activer</option>
                        <option value="false">Désactiver</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {bulkOperation === 'delete' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">
                        Suppression définitive
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        Cette action supprimera définitivement {selectedUsers.length} utilisateur(s).
                        Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Résultats de l'opération */}
              {results && (
                <div className={`mb-6 p-4 rounded-lg ${
                  results.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {results.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${
                        results.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {results.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeBulkModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isProcessing}
                >
                  Annuler
                </button>
                <button
                  onClick={executeBulkOperation}
                  disabled={isProcessing}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    bulkOperation === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Traitement...
                    </div>
                  ) : (
                    bulkOperation === 'delete' ? 'Supprimer' : 'Modifier'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkOperationsToolbar;
