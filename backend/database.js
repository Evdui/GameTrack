const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction
        ? { rejectUnauthorized: false }
        : false
});

async function initializeDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS games (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            genre TEXT,
            platform TEXT NOT NULL,
            progress INTEGER NOT NULL,
            status TEXT NOT NULL,
            notes TEXT
        )
    `);

    console.log("Database ready");
}

module.exports = {
    pool,
    initializeDatabase
};

