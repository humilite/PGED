const User = require('../models/User');

// Créer un nouvel utilisateur
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer l'utilisateur
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      department
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: user
    });
  } catch (error) {
    console.error('Erreur création utilisateur:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Erreur de validation',
        details: messages
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Récupérer tous les utilisateurs avec pagination et recherche
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    // Construire la requête de recherche
    let query = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const result = await User.findWithPagination(query, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// Récupérer un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur invalide'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, department, isActive } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier l'unicité de l'email si modifié
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Un utilisateur avec cet email existe déjà'
        });
      }
    }

    // Mettre à jour les champs
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Erreur de validation',
        details: messages
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur invalide'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur invalide'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
