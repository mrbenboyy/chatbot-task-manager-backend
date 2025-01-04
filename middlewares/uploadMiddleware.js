const multer = require('multer');
const path = require('path');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dossier où les images seront enregistrées
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non pris en charge'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limite à 5MB
    fileFilter: fileFilter,
});

module.exports = upload;
