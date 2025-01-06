const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Inscription
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : ''; // URL de l'image de profil

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Utilisateur déjà existant.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage, // Ajouter l'URL de l'image
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Connexion
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        // Vérifier le mot de passe
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Mot de passe incorrect." });
        }

        // Générer un token JWT
        const token = generateToken(user._id);

        res.json({
            message: "Connexion réussie.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error.message);
        res.status(500).json({ message: "Erreur serveur.", error: error.message });
    }
};

// Récupérer les informations utilisateur
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // Exclure le mot de passe
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du profil utilisateur." });
    }
};

// Mettre à jour les informations utilisateur
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        const { name, email, password } = req.body;

        // Mettre à jour le nom et l'email si fournis
        if (name) user.name = name;
        if (email) user.email = email;

        // Si un nouveau mot de passe est fourni, le hacher
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        // Gestion de l'image de profil
        if (req.file) {
            user.profileImage = `/uploads/${req.file.filename}`; // Enregistrer le chemin de l'image
        }

        const updatedUser = await user.save(); // Sauvegarder les changements dans la base de données

        res.status(200).json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImage: updatedUser.profileImage, // Retourner la nouvelle image
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour des informations utilisateur." });
    }
};




module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
