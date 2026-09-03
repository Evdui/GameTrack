const Database = require("better-sqlite3");

const db = new Database("games.db");

db.prepare(`
    CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        platform TEXT NOT NULL,
        progress INTEGER NOT NULL,
        status TEXT NOT NULL,
        notes TEXT
    )
`).run();

console.log("Database ready");

module.exports = db;