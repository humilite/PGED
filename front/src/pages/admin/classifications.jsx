import React, { useState, useEffect } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import styled from 'styled-components';
import api from '../../services/api';
import {
  Plus, Edit2, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown,
  Search, X, Save, Loader, AlertCircle, Layers, GitBranch, Home
} from 'lucide-react';

// Styled Components avec design moderne
const StyledTreeContainer = styled.div`
  .react-organizational-chart {
    display: flex;
    justify-content: center;
  }
`;

const StyledNode = styled.div`
  padding: 16px 20px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  background: linear-linear(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 280px;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
    background: linear-linear(135deg, #ffffff 0%, #f1f5f9 100%);
  }
  
  &.selected {
    border-color: #10b981;
    background: linear-linear(135deg, #f0fdf4 0%, #dcfce7 100%);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
  }
`;

const NodeContent = styled.div`
  flex: 1;
`;

const NodeCode = styled.div`
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 6px;
`;

const NodeName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  line-height: 1.4;
`;

const NodeDescription = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
  margin-top: 4px;
`;

const NodeActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${StyledNode}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    
    &.edit {
      background: #eff6ff;
      color: #3b82f6;
    }
    
    &.delete {
      background: #fef2f2;
      color: #ef4444;
    }
  }
`;

// Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s ease;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ModalFooter = styled.div`
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  
  &.btn-secondary {
    background: #f1f5f9;
    color: #475569;
    
    &:hover {
      background: #e2e8f0;
    }
  }
  
  &.btn-primary {
    background: linear-linear(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    
    &:hover {
      background: linear-linear(135deg, #2563eb 0%, #1d4ed8 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Loading Component
const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ClassificationPage = () => {
  const [classifications, setClassifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    parent_id: null
  });

  useEffect(() => {
    fetchClassifications();
  }, []);

  const fetchClassifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classifications/tree');
      setClassifications(response.data);
    } catch (error) {
      console.error('Error fetching classifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({ code: '', name: '', description: '', parent_id: null });
    setShowModal(true);
  };

  const handleEdit = (node) => {
    setModalMode('edit');
    setFormData({
      code: node.code,
      name: node.name,
      description: node.description || '',
      parent_id: node.parent_id
    });
    setSelectedNode(node);
    setShowModal(true);
  };

  const handleDelete = async (node) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classification "${node.name}" ? Cette action est irréversible.`)) {
      try {
        await api.delete(`/classifications/${node.id}`);
        fetchClassifications();
      } catch (error) {
        console.error('Error deleting classification:', error);
        alert('Erreur lors de la suppression. Cette classification peut contenir des sous-classifications.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await api.post('/classifications', formData);
      } else {
        await api.put(`/classifications/${selectedNode.id}`, formData);
      }
      setShowModal(false);
      fetchClassifications();
    } catch (error) {
      console.error('Error saving classification:', error);
      alert('Erreur lors de la sauvegarde. Vérifiez que le code est unique.');
    }
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const filterClassifications = (nodes, term) => {
    if (!term) return nodes;
    
    return nodes.filter(node => {
      const matches = 
        node.code.toLowerCase().includes(term.toLowerCase()) ||
        node.name.toLowerCase().includes(term.toLowerCase()) ||
        (node.description && node.description.toLowerCase().includes(term.toLowerCase()));
      
      if (matches) return true;
      
      if (node.children && node.children.length > 0) {
        const filteredChildren = filterClassifications(node.children, term);
        if (filteredChildren.length > 0) {
          return true;
        }
      }
      
      return false;
    });
  };

  const renderTree = (nodes, depth = 0) => {
    const filteredNodes = searchTerm ? filterClassifications(nodes, searchTerm) : nodes;
    
    return filteredNodes.map(node => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      const isSelected = selectedNode?.id === node.id;

      return (
        <TreeNode
          key={node.id}
          label={
            <StyledNode className={isSelected ? 'selected' : ''}>
              <NodeContent onClick={() => setSelectedNode(node)}>
                <NodeCode>{node.code}</NodeCode>
                <NodeName>{node.name}</NodeName>
                {node.description && (
                  <NodeDescription>{node.description}</NodeDescription>
                )}
              </NodeContent>
              <NodeActions>
                {hasChildren && (
                  <ActionButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(node.id);
                    }}
                    className="toggle"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </ActionButton>
                )}
                <ActionButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(node);
                  }}
                  className="edit"
                >
                  <Edit2 size={16} />
                </ActionButton>
                <ActionButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(node);
                  }}
                  className="delete"
                >
                  <Trash2 size={16} />
                </ActionButton>
              </NodeActions>
            </StyledNode>
          }
        >
          {hasChildren && isExpanded && renderTree(node.children, depth + 1)}
        </TreeNode>
      );
    });
  };

  const getStatistics = () => {
    let totalNodes = 0;
    let maxDepth = 0;
    
    const countNodes = (nodes, depth = 0) => {
      totalNodes += nodes.length;
      maxDepth = Math.max(maxDepth, depth);
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          countNodes(node.children, depth + 1);
        }
      });
    };
    
    countNodes(classifications);
    return { totalNodes, maxDepth };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <LoadingSpinner>
        <Spinner />
        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Chargement du plan de classement...
        </div>
      </LoadingSpinner>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg">
                <Layers className="text-white" size={24} />
              </div>
              Plan de classement hiérarchique
            </h1>
            <p className="text-gray-600 mt-2">
              Visualisez et gérez la structure hiérarchique de vos classifications documentaires
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une classification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button
              onClick={handleCreate}
              className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              Nouvelle classification
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Classifications Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalNodes}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FolderOpen className="text-blue-500" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Niveau Maximum</p>
                <p className="text-3xl font-bold text-gray-900">{stats.maxDepth + 1}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <GitBranch className="text-green-500" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Racines</p>
                <p className="text-3xl font-bold text-gray-900">{classifications.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Home className="text-purple-500" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Tree Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          {classifications.length > 0 ? (
            <StyledTreeContainer>
              <Tree
                lineWidth={'2px'}
                lineColor={'#e2e8f0'}
                lineBorderRadius={'8px'}
                label={
                  <StyledNode>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-linear-to-br from-gray-100 to-gray-200 rounded-lg">
                        <Folder className="text-gray-600" size={20} />
                      </div>
                      <div>
                        <NodeName style={{ color: '#475569', fontSize: '0.875rem', fontWeight: 500 }}>
                          Racine du plan de classement
                        </NodeName>
                        <NodeDescription>
                          Base hiérarchique de toutes les classifications
                        </NodeDescription>
                      </div>
                    </div>
                  </StyledNode>
                }
              >
                {renderTree(classifications)}
              </Tree>
            </StyledTreeContainer>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                <Folder className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune classification trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par créer votre première classification pour structurer vos documents.
              </p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                Créer la première classification
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Comment utiliser
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ChevronRight className="text-blue-500" size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Navigation</p>
                <p className="text-sm text-gray-600">Cliquez sur les flèches pour développer/réduire les sous-classifications</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Edit2 className="text-green-500" size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Modification</p>
                <p className="text-sm text-gray-600">Utilisez les icônes d'édition pour modifier une classification</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Trash2 className="text-red-500" size={16} />
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Suppression</p>
                <p className="text-sm text-gray-600">Supprimez uniquement les classifications sans enfants</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? (
                  <>
                    <Plus size={20} />
                    Nouvelle Classification
                  </>
                ) : (
                  <>
                    <Edit2 size={20} />
                    Modifier la Classification
                  </>
                )}
              </ModalTitle>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </ModalHeader>
            
            <ModalContent>
              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <FormLabel htmlFor="code">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Code de Classification
                  </FormLabel>
                  <FormInput
                    type="text"
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="Ex: ADM-001"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Utilisez un code unique pour identifier cette classification
                  </div>
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="name">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Nom de la Classification
                  </FormLabel>
                  <FormInput
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Administration Générale"
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="description">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Description
                  </FormLabel>
                  <FormTextarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Décrivez l'objet de cette classification..."
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel htmlFor="parent_id">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Classification Parente
                  </FormLabel>
                  <FormSelect
                    id="parent_id"
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({...formData, parent_id: e.target.value || null})}
                  >
                    <option value="">👑 Classification Racine (niveau supérieur)</option>
                    {(() => {
                      const flattenNodes = (nodes) => {
                        let result = [];
                        nodes.forEach(node => {
                          result.push(node);
                          if (node.children && node.children.length > 0) {
                            result = result.concat(flattenNodes(node.children));
                          }
                        });
                        return result;
                      };
                      
                      const allNodes = flattenNodes(classifications);
                      if (modalMode === 'edit') {
                        // Exclure le nœud actuel et ses descendants de la liste des parents
                        const excludeIds = new Set();
                        const collectIds = (node) => {
                          excludeIds.add(node.id);
                          if (node.children) {
                            node.children.forEach(collectIds);
                          }
                        };
                        collectIds(selectedNode);
                        return allNodes.filter(node => !excludeIds.has(node.id));
                      }
                      return allNodes;
                    })().map(node => (
                      <option key={node.id} value={node.id}>
                        {'― '.repeat(node.depth || 0)} {node.code} - {node.name}
                      </option>
                    ))}
                  </FormSelect>
                  <div className="text-xs text-gray-500 mt-1">
                    Sélectionnez une classification parente pour créer une hiérarchie
                  </div>
                </FormGroup>
              </form>
            </ModalContent>
            
            <ModalFooter>
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                className="btn-primary"
              >
                <Save size={16} />
                {modalMode === 'create' ? 'Créer la Classification' : 'Enregistrer les Modifications'}
              </Button>
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}
    </div>
  );
};

export default ClassificationPage;