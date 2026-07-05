const express = require('express');
const router = express.Router();
const multer = require('multer');

// Importation de tous tes contrôleurs existants
const visionController = require('../controllers/visionController');
const cultureController = require('../controllers/cultureController');
const harvestController = require('../controllers/harvestController');
const inventoryController = require('../controllers/inventoryController');

// Filtre de sécurité pour valider le type de fichier (Universel)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Fichier accepté
    } else {
        cb(new Error('Format de fichier non supporté. Veuillez téléverser une image (JPG, PNG ou WEBP).'), false);
    }
};

// Configuration du stockage en mémoire avec limite et filtre
const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5 Mo max
});

// ROUTE 1 : Diagnostic IA par Image (Cœur du projet - URL d'origine conservée)
router.post('/vision/analyse', upload.single('image_culture'), visionController.analyserCulture);

// Les autres routes de gestion de ton portfolio agricole
router.post('/cultures', cultureController.ajouterCulture);
router.get('/cultures', cultureController.obtenirCultures);
router.delete('/cultures/:id', cultureController.supprimerCulture);

router.post('/recoltes', harvestController.ajouterRecolte);
router.get('/recoltes', harvestController.obtenirRecoltes);

router.post('/intrants', inventoryController.ajouterIntrant);
router.get('/intrants', inventoryController.obtenirInventaire);

// Middleware global pour intercepter proprement les erreurs Multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                message: 'Le fichier est trop volumineux. La taille maximale autorisée est de 5 Mo.'
            });
        }
    }
    if (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
    next();
});

module.exports = router;