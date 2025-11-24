-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table du plan de classement
CREATE TABLE classification_plan (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES classification_plan(id),
    path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des documents
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    index_alphanum VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    classification_id INTEGER REFERENCES classification_plan(id),
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft',
    confidentiality_level VARCHAR(50) DEFAULT 'interne',
    metadata JSONB,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des métadonnées
CREATE TABLE document_metadata (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimisation des recherches
CREATE INDEX idx_documents_index ON documents(index_alphanum);
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_documents_classification ON documents(classification_id);
CREATE INDEX idx_documents_metadata ON documents USING gin(metadata);

-- Données de base pour le plan de classement
INSERT INTO classification_plan (code, name, description, path) VALUES
('RH', 'Ressources Humaines', 'Catégorie principale RH', 'RH'),
('RH-CTR', 'Contrats', 'Contrats de travail', 'RH/RH-CTR'),
('RH-DOS', 'Dossiers Personnel', 'Dossiers individuels', 'RH/RH-DOS'),
('RH-RAP', 'Rapports', 'Rapports d''activité', 'RH/RH-RAP'),
('RH-POL', 'Politiques', 'Politiques RH', 'RH/RH-POL');

-- Utilisateur admin par défaut
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('admin@dgrh.gov.ga', '$2a$10$xyz123', 'Admin', 'System', 'admin');