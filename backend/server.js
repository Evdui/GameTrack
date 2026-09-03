const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { pool, initializeDatabase } = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});


// Create a game
app.post("/games", async (req, res) => {
    try {
        const {
            title,
            genre,
            platform,
            progress,
            status,
            notes
        } = req.body;

        const result = await pool.query(`
            INSERT INTO games (
                title,
                genre,
                platform,
                progress,
                status,
                notes
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            title,
            genre,
            platform,
            progress,
            status,
            notes
        ]);

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("Error creating game:", error);
        res.status(500).json({
            error: "Failed to create game"
        });
    }
});


// Get all games
app.get("/games", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM games
            ORDER BY id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({
            error: "Failed to fetch games"
        });
    }
});


// Update a game
app.put("/games/:id", async (req, res) => {
    try {
        const {
            title,
            genre,
            platform,
            progress,
            status,
            notes
        } = req.body;

        const id = req.params.id;

        const result = await pool.query(`
            UPDATE games
            SET
                title = $1,
                genre = $2,
                platform = $3,
                progress = $4,
                status = $5,
                notes = $6
            WHERE id = $7
            RETURNING *
        `, [
            title,
            genre,
            platform,
            progress,
            status,
            notes,
            id
        ]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Game not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error updating game:", error);
        res.status(500).json({
            error: "Failed to update game"
        });
    }
});


// Delete a game
app.delete("/games/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const result = await pool.query(`
            DELETE FROM games
            WHERE id = $1
        `, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: "Game not found"
            });
        }

        res.json({
            message: "Game deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting game:", error);
        res.status(500).json({
            error: "Failed to delete game"
        });
    }
});


// Start server after database initialization
async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to initialize database:", error);
        process.exit(1);
    }
}

startServer();