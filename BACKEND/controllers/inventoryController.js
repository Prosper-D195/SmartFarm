const pool = require('../config/db');

// 1. AJOUTER OU METTRE À JOUR UN INTRANT (Create / Update)
exports.ajouterIntrant = async (req, res) => {
    try {
        const { nom_produit, type_produit, quantite_stock, unite_mesure, seuil_alerte, culture_cible_id } = req.body;

        if (!nom_produit || !type_produit || quantite_stock === undefined) {
            return res.status(400).json({ 
                status: "error", 
                message: "Le nom, le type et la quantité initiale sont obligatoires." 
            });
        }

        const query = `
            INSERT INTO inventaire_intrants 
            (nom_produit, type_produit, quantite_stock, unite_mesure, seuil_alerte, culture_cible_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
        
        const values = [
            nom_produit, 
            type_produit, 
            quantite_stock, 
            unite_mesure || 'litres', 
            seuil_alerte || 5.00, 
            culture_cible_id || null
        ];

        const result = await pool.query(query, values);

        return res.status(201).json({
            status: "success",
            message: "Produit ajouté à l'inventaire avec succès.",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("[SmartFarm - Inventory] Erreur lors de l'ajout :", error);
        return res.status(500).json({ status: "error", message: "Erreur serveur." });
    }
};

// 2. RÉCUPÉRER L'INVENTAIRE COMPLET (Avec calcul dynamique des alertes)
exports.obtenirInventaire = async (req, res) => {
    try {
        const query = `
            SELECT i.*, c.nom_culture 
            FROM inventaire_intrants i
            LEFT JOIN types_cultures c ON i.culture_cible_id = c.id
            ORDER BY i.nom_produit ASC;
        `;
        const result = await pool.query(query);

        // Ajout dynamique d'un indicateur booléen "alerte_declenchee" pour le Frontend
        const inventaireAvecAlertes = result.rows.map(produit => ({
            ...produit,
            alerte_declenchee: parseFloat(produit.quantite_stock) <= parseFloat(produit.seuil_alerte)
        }));

        return res.status(200).json({
            status: "success",
            results: inventaireAvecAlertes.length,
            data: inventaireAvecAlertes
        });
    } catch (error) {
        console.error("[SmartFarm - Inventory] Erreur de lecture :", error);
        return res.status(500).json({ status: "error", message: "Erreur serveur." });
    }
};