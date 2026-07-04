const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configuration du stockage temporaire des images téléversées
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5 Mo max
});

// Importation des contrôleurs
const visionController = require('../controllers/visionController');
const cultureController = require('../controllers/cultureController');
const harvestController = require('../controllers/harvestController');
// (Les autres contrôleurs seront importés ici au fur et à mesure)

// ROUTE 1 : Diagnostic IA par Image (Cœur du projet)
// 'image_culture' sera le nom du champ à envoyer depuis le Frontend
router.post('/vision/analyse', upload.single('image_culture'), visionController.analyserCulture);
router.post('/cultures', cultureController.ajouterCulture);
router.get('/cultures', cultureController.obtenirCultures);
router.delete('/cultures/:id', cultureController.supprimerCulture);
router.post('/recoltes', harvestController.ajouterRecolte);
router.get('/recoltes', harvestController.obtenirRecoltes);

module.exports = router;