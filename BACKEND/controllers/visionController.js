// On utilise le nouveau package officiel unifié de Google
const { GoogleGenAI } = require('@google/genai');
const pool = require('../config/db');

// L'initialisation moderne fonctionne enfin parfaitement ici
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.analyserCulture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "Aucune image n'a été téléversée." });
        }

        const { culture_id } = req.body; 

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            },
        };

        const prompt = `
            Tu agis en tant qu'expert phytosanitaire et ingénieur agronome de pointe pour l'entreprise agricole "L'AIGLE ROYAL".
            Analyse cette image de culture. Tu dois identifier la culture, détecter la maladie ou l'anomalie présente, et fournir des solutions claires.
            
            Réponds STRICTEMENT sous la forme d'un objet JSON valide au format suivant, sans texte avant ou après, et sans balises markdown de bloc de code :
            {
              "culture_detectee": "Nom de la culture identifiée",
              "anomalie_detectee": "Nom précis de la maladie, carence ou ravageur",
              "certitude_ia": "Pourcentage ex: 92%",
              "symptomes_observes": "Description textuelle détaillée des symptômes visibles sur l'image.",
              "solutions_proposees": ["Solution curative 1", "Solution biologique ou préventive 2", "Conseil d'expert 3"]
            }
        `;

        console.log("[L'AIGLE ROYAL - IA] Envoi de l'image à Gemini...");
        
        // Syntaxe moderne du nouveau SDK de Google AI Studio
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [prompt, imagePart],
        });
        
        const responseText = response.text;

        let buildAnalysis;
        try {
            buildAnalysis = JSON.parse(responseText.trim());
        } catch (parseError) {
            console.error("[L'AIGLE ROYAL - IA] Échec du parsing JSON natif, nettoyage en cours...", responseText);
            throw new Error("L'IA n'a pas renvoyé un format de données standardisé.");
        }

        const insertQuery = `
            INSERT INTO historique_analyses 
            (culture_id, culture_detectee, anomalie_detectee, certitude_ia, symptomes_observes, solutions_proposees)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        
        const values = [
            culture_id || null, 
            buildAnalysis.culture_detectee,
            buildAnalysis.anomalie_detectee,
            buildAnalysis.certitude_ia,
            buildAnalysis.symptomes_observes,
            buildAnalysis.solutions_proposees
        ];

        const dbResult = await pool.query(insertQuery, values);

        return res.status(200).json({
            status: "success",
            message: "Analyse agronomique complétée et enregistrée avec succès.",
            data: dbResult.rows[0]
        });

    } catch (error) {
        console.error("[L'AIGLE ROYAL - IA] Erreur lors du diagnostic :", error);
        return res.status(500).json({
            status: "error",
            message: "Une erreur est survenue lors de l'analyse par intelligence artificielle.",
            details: error.message
        });
    }
};