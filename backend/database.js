const Database = require("better-sqlite3");

const db = new Database("games.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        genre TEXT,
        platform TEXT NOT NULL,
        progress INTEGER NOT NULL,
        status TEXT NOT NULL,
        notes TEXT
    )
`).run();

// Add genre to an existing database if the column does not exist
const columns = db.prepare(`PRAGMA table_info(games)`).all();

const hasGenreColumn = columns.some(column => column.name === "genre");

if (!hasGenreColumn) {
    db.prepare(`ALTER TABLE games ADD COLUMN genre TEXT`).run();
}

console.log("Database ready");

module.exports = db;