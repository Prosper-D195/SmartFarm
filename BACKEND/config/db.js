const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.ProsperDosu70113,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432, // 💡 Sécurité : Force la conversion en entier
    database: process.env.DB_NAME
});

pool.on('connect', () => {
    console.log("[L'AIGLE ROYAL - DB] Connexion établie avec PostgreSQL (smartfarm_db).");
});

pool.on('error', (err) => {
    console.error("[L'AIGLE ROYAL - DB] Erreur inattendue sur le pool de connexion :", err);
});

module.exports = pool;