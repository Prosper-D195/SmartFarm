const pool = require('../config/db');

// 1. AJOUTER UNE NOUVELLE CULTURE (Create)
exports.ajouterCulture = async (req, res) => {
    try {
        const { nom_culture, categorie } = req.body;

        if (!nom_culture || !categorie) {
            return res.status(400).json({ 
                status: "error", 
                message: "Le nom de la culture et la catégorie sont obligatoires." 
            });
        }

        const query = `
            INSERT INTO types_cultures (nom_culture, categorie) 
            VALUES ($1, $2) 
            RETURNING *;
        `;
        const result = await pool.query(query, [nom_culture, categorie]);

        return res.status(201).json({
            status: "success",
            message: "Nouvelle culture ajoutée avec succès.",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("[SmartFarm - Culture] Erreur lors de l'ajout :", error);
        
        // Gestion des doublons (Nom unique en base)
        if (error.code === '23505') {
            return res.status(400).json({
                status: "error",
                message: "Cette culture existe déjà dans le système."
            });
        }

        return res.status(500).json({ status: "error", message: "Erreur serveur." });
    }
};

// 2. RÉCUPÉRER TOUTES LES CULTURES (Read)
exports.obtenirCultures = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM types_cultures ORDER BY nom_culture ASC;');
        return res.status(200).json({
            status: "success",
            results: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error("[SmartFarm - Culture] Erreur de lecture :", error);
        return res.status(500).json({ status: "error", message: "Erreur serveur." });
    }
};

// 3. SUPPRIMER UNE CULTURE (Delete)
exports.supprimerCulture = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM types_cultures WHERE id = $1 RETURNING *;', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Culture introuvable."
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Culture supprimée avec succès."
        });
    } catch (error) {
        console.error("[SmartFarm - Culture] Erreur de suppression :", error);
        return res.status(500).json({ status: "error", message: "Erreur serveur." });
    }
};