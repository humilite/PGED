// Correction avec noms de fichiers en minuscules
const User = require('./user');
const Document = require('./document');
const Classification = require('./classification');

// Définir les relations entre les modèles
User.hasMany(Document, { foreignKey: 'createdBy' });
Document.belongsTo(User, { foreignKey: 'createdBy' });

Classification.hasMany(Document, { foreignKey: 'classificationId' });
Document.belongsTo(Classification, { foreignKey: 'classificationId' });

module.exports = {
  User,
  Document,
  Classification
};