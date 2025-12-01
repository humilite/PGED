import React, { useState, useEffect } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import styled from 'styled-components';
import api from '../../services/api';

const StyledNode = styled.div`
  padding: 5px;
  border-radius: 8px;
  display: inline-block;
  border: 1px solid #ccc;
  background: white;
`;

const ClassificationPage = () => {
  const [classifications, setClassifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
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
      description: node.description,
      parent_id: node.parent_id
    });
    setSelectedNode(node);
    setShowModal(true);
  };

  const handleDelete = async (node) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classification ?')) {
      try {
        await api.delete(`/classifications/${node.id}`);
        fetchClassifications();
      } catch (error) {
        console.error('Error deleting classification:', error);
        alert('Erreur lors de la suppression');
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
      alert('Erreur lors de la sauvegarde');
    }
  };

  const renderTree = (nodes) => {
    return nodes.map(node => (
      <TreeNode
        key={node.id}
        label={
          <StyledNode>
            <div className="flex items-center justify-between">
              <span>{node.code} - {node.name}</span>
              <div className="ml-4">
                <button
                  onClick={() => handleEdit(node)}
                  className="text-blue-500 hover:text-blue-700 mr-2"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(node)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            </div>
          </StyledNode>
        }
      >
        {node.children && node.children.length > 0 && renderTree(node.children)}
      </TreeNode>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Plan de classement hiérarchique</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ajouter une classification
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {classifications.length > 0 ? (
          <Tree
            lineWidth={'2px'}
            lineColor={'#ccc'}
            lineBorderRadius={'10px'}
            label={<StyledNode>Racine</StyledNode>}
          >
            {renderTree(classifications)}
          </Tree>
        ) : (
          <p className="text-gray-500 text-center">Aucune classification trouvée.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalMode === 'create' ? 'Créer une Classification' : 'Modifier la Classification'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="code">
                    Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parent_id">
                    Parent
                  </label>
                  <select
                    id="parent_id"
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({...formData, parent_id: e.target.value || null})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Aucun parent (racine)</option>
                    {classifications.flatMap(node => [node, ...(node.children || [])]).map(node => (
                      <option key={node.id} value={node.id}>
                        {node.code} - {node.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    {modalMode === 'create' ? 'Créer' : 'Modifier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassificationPage;
