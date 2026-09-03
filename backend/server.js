const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Create a game
app.post("/games", (req, res) => {
    const { title, platform, progress, status, notes } = req.body;

    const result = db.prepare(`
        INSERT INTO games (title, platform, progress, status, notes)
        VALUES (?, ?, ?, ?, ?)
    `).run(title, platform, progress, status, notes);

    const game = db.prepare(`
        SELECT * FROM games WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(game);
});

// Get all games
app.get("/games", (req, res) => {
    const games = db.prepare(`
        SELECT * FROM games
        ORDER BY id DESC
    `).all();

    res.json(games);
});

// Update a game
app.put("/games/:id", (req, res) => {
    const { title, platform, progress, status, notes } = req.body;
    const id = req.params.id;

    const result = db.prepare(`
        UPDATE games
        SET title = ?, platform = ?, progress = ?, status = ?, notes = ?
        WHERE id = ?
    `).run(title, platform, progress, status, notes, id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Game not found" });
    }

    const game = db.prepare(`
        SELECT * FROM games WHERE id = ?
    `).get(id);

    res.json(game);
});

// Delete a game
app.delete("/games/:id", (req, res) => {
    const id = req.params.id;

    const result = db.prepare(`
        DELETE FROM games
        WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Game deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});