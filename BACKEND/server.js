const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité et d'analyse du corps des requêtes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware global pour gérer le "Mode Démo" sur les requêtes d'écriture (POST, PUT, DELETE)
app.use((req, res, next) => {
    const isDemoMode = process.env.NODE_ENV === 'production'; // Activé automatiquement en production
    const isWriteOperation = ['POST', 'PUT', 'DELETE'].includes(req.method);
    
    // Exception pour le téléversement d'images pour l'analyse IA qui doit rester fonctionnel
    const isAiAnalysis = req.path.includes('/api/vision');

    if (isDemoMode && isWriteOperation && !isAiAnalysis) {
        return res.status(403).json({
            status: "error",
            message: "Action impossible en mode Démo : Les droits de modification sont réservés à l'administrateur de L'AIGLE ROYAL."
        });
    }
    next();
});

// Route de test pour s'assurer que le serveur fonctionne et répond
app.get('/', (req, res) => {
    res.json({ 
        message: "Bienvenue sur l'API SmartFarm de L'AIGLE ROYAL", 
        status: "Serveur opérationnel" 
    });
});

// Liaison avec les routes de l'API (que nous allons coder ensuite)
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`[L'AIGLE ROYAL - SmartFarm] Serveur démarré sur le port ${PORT}`);
});