import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Search from './pages/search';
import Upload from './pages/upload';
import DocumentView from './pages/documentView';
import EditDocument from './pages/editDocument';
import AdminDashboard from './pages/admin/admindashboard';
// Supprimez l'import Reports s'il n'existe pas
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/search" element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
          
          <Route path="/documents/:id" element={
            <ProtectedRoute>
              <DocumentView />
            </ProtectedRoute>
          } />
          
          <Route path="/documents/:id/edit" element={
            <ProtectedRoute>
              <EditDocument />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Supprimez la route Reports si le composant n'existe pas */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;