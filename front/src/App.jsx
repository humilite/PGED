import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Search from './pages/search';
import Upload from './pages/upload';
import DocumentView from './pages/documentView';
import EditDocument from './pages/editDocument';
import AdminDashboard from './pages/admin/admindashboard';
import UsersPage from './pages/admin/users';
// Supprimez l'import Reports s'il n'existe pas
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <Layout>
                <Search />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/upload" element={
            <ProtectedRoute>
              <Layout>
                <Upload />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/documents/:id" element={
            <ProtectedRoute>
              <Layout>
                <DocumentView />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/documents/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <EditDocument />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute>
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Supprimez la route Reports si le composant n'existe pas */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;