const pool = require('../config/db');

// 1. ENREGISTRER UNE NOUVELLE RÉCOLTE (Create)
exports.ajouterRecolte = async (req, res) => {
    try {
        const { culture_id, quantite_recoltee, unite_recolte, date_recolte, pourcentage_murs, pourcentage_non_murs, remarques } = req.body;

        if (!culture_id || !quantite_recoltee) {
            return res.status(400).json({ 
                status: "error", 
                message: "La culture et la quantité récoltée sont obligatoires." 
            });
        }

        const query = `
            INSERT INTO suivi_recoltes 
            (culture_id, quantite_recoltee, unite_recolte, date_recolte, pourcentage_murs, pourcentage_non_murs, remarques) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *;
        `;
        
        const values = [
            culture_id, 
            quantite_recoltee, 
            unite_recolte || 'kg', 
            date_recolte || new Date(), 
            pourcentage_murs || 0.00, 
            pourcentage_non_murs || 0.00, 
            remarques
        ];

        const result = await pool.query(query, values);

        return res.status(201).json({
            status: "success",
            message: "Récolte enregistrée avec succès.",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("[SmartFarm - Harvest] Erreur lors de l'ajout :", error);
        return res.status(500).json({ status: "error", message: "Erreur serveur." });
    }
};

// 2. RÉCUPÉRER TOUTES LES RÉCOLTES (Read - Pour les graphiques et tableaux)
exports.obtenirRecoltes = async (req, res) => {
    try {
        // Jointure pour récupérer le nom de la culture à la place de l'ID seul
        const query = `
            SELECT r.*, c.nom_culture, c.categorie 
            FROM suivi_recoltes r
            JOIN types_cultures c ON r.culture_id = c.id
            ORDER BY r.date_recolte DESC;
        `;
        const result = await pool.query(query);
        
        return res.status(200).json({
            status: "success",
            results: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error("[SmartFarm - Harvest] Erreur de lecture :", error);
        return res.status(500).json({ status: "error", message: "Erreur serveur." });
    }
};