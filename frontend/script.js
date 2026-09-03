const BACKEND_URL = "http://localhost:3000";

const gameForm = document.getElementById("game-form");
const gamesList = document.getElementById("games-list");

const titleInput = document.getElementById("title");
const genreInput = document.getElementById("genre");
const platformInput = document.getElementById("platform");
const progressInput = document.getElementById("progress");
const statusInput = document.getElementById("status");
const notesInput = document.getElementById("notes");

const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");

const loadingMessage = document.getElementById("loading");
const errorMessage = document.getElementById("error");

const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const platformFilter = document.getElementById("platform-filter");

let editingGameId = null;
let allGames = [];


// Show an error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}


// Hide the error message
function hideError() {
    errorMessage.classList.add("hidden");
}


// Load all games
async function loadGames() {
    loadingMessage.classList.remove("hidden");
    hideError();

    try {
        const response = await fetch(`${BACKEND_URL}/games`);

        if (!response.ok) {
            throw new Error("Failed to load games");
        }

        const games = await response.json();

        allGames = games;

        updateFilters(games);
        applyFilters();
        updateStats(games);

    } catch (error) {
        console.error(error);
        showError("Could not connect to the backend. Please try again.");
    } finally {
        loadingMessage.classList.add("hidden");
    }
}


// Apply search and filters
function applyFilters() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedPlatform = platformFilter.value;

    const filteredGames = allGames.filter((game) => {

        const matchesSearch =
            game.title.toLowerCase().includes(searchText) ||
            game.genre.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            game.status === selectedStatus;

        const matchesPlatform =
            selectedPlatform === "all" ||
            game.platform === selectedPlatform;

        return matchesSearch && matchesStatus && matchesPlatform;
    });

    displayGames(filteredGames);
}


// Update filter dropdowns
function updateFilters(games) {

    const statuses = [
        ...new Set(games.map(game => game.status))
    ];

    const platforms = [
        ...new Set(games.map(game => game.platform))
    ];

    statusFilter.innerHTML = `
        <option value="all">All Status</option>

        ${statuses.map(status => `
            <option value="${status}">
                ${status}
            </option>
        `).join("")}
    `;

    platformFilter.innerHTML = `
        <option value="all">All Platforms</option>

        ${platforms.map(platform => `
            <option value="${platform}">
                ${platform}
            </option>
        `).join("")}
    `;
}


// Update statistics
function updateStats(games) {

    const totalGames = games.length;

    const playingGames = games.filter(
        game => game.status === "Playing"
    ).length;

    const completedGames = games.filter(
        game => game.status === "Completed"
    ).length;

    const averageProgress = totalGames > 0
        ? Math.round(
            games.reduce(
                (sum, game) => sum + Number(game.progress),
                0
            ) / totalGames
        )
        : 0;

    document.getElementById("total-games").textContent =
        totalGames;

    document.getElementById("playing-games").textContent =
        playingGames;

    document.getElementById("completed-games").textContent =
        completedGames;

    document.getElementById("average-progress").textContent =
        `${averageProgress}%`;
}


// Display games
function displayGames(games) {

    gamesList.innerHTML = "";

    if (games.length === 0) {
        gamesList.innerHTML = "<p>No games found.</p>";
        return;
    }

    games.forEach((game) => {

        const gameCard = document.createElement("div");

        gameCard.className = "game-card";

        gameCard.innerHTML = `
            <h3>${game.title}</h3>

            <p>
                <strong>Genre:</strong>
                ${game.genre}
            </p>

            <p>
                <strong>Platform:</strong>
                ${game.platform}
            </p>

            <p>
                <strong>Status:</strong>
                ${game.status}
            </p>

            <p>
                <strong>Progress:</strong>
                ${game.progress}%
            </p>

            <div class="progress-container">
                <div
                    class="progress-bar"
                    style="width: ${game.progress}%"
                ></div>
            </div>

            <p>
                <strong>Notes:</strong>
                ${game.notes || "No notes"}
            </p>

            <div class="game-actions">

                <button
                    class="edit-button"
                    onclick="startEdit(${game.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-button"
                    onclick="deleteGame(${game.id})"
                >
                    Delete
                </button>

            </div>
        `;

        gamesList.appendChild(gameCard);
    });
}


// Add or update a game
gameForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    hideError();

    const gameData = {
        title: titleInput.value.trim(),
        genre: genreInput.value.trim(),
        platform: platformInput.value.trim(),
        progress: Number(progressInput.value),
        status: statusInput.value,
        notes: notesInput.value.trim()
    };

    try {

        let response;

        if (editingGameId === null) {

            // Create a new game
            response = await fetch(`${BACKEND_URL}/games`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(gameData)
            });

        } else {

            // Update existing game
            response = await fetch(
                `${BACKEND_URL}/games/${editingGameId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(gameData)
                }
            );
        }

        if (!response.ok) {
            throw new Error("Request failed");
        }

        resetForm();

        await loadGames();

    } catch (error) {

        console.error(error);

        showError(
            "Could not save the game. Please try again."
        );
    }
});


// Start editing a game
async function startEdit(id) {

    hideError();

    try {

        const response = await fetch(
            `${BACKEND_URL}/games`
        );

        if (!response.ok) {
            throw new Error("Failed to load games");
        }

        const games = await response.json();

        const game = games.find(
            game => game.id === id
        );

        if (!game) {
            throw new Error("Game not found");
        }

        titleInput.value = game.title;
        genreInput.value = game.genre || "";
        platformInput.value = game.platform;
        progressInput.value = game.progress;
        statusInput.value = game.status;
        notesInput.value = game.notes || "";

        editingGameId = id;

        formTitle.textContent = "Edit Game";
        submitButton.textContent = "Update Game";

        cancelButton.classList.remove("hidden");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(error);

        showError(
            "Could not load the game for editing."
        );
    }
}


// Delete a game
async function deleteGame(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this game?"
    );

    if (!confirmed) {
        return;
    }

    hideError();

    try {

        const response = await fetch(
            `${BACKEND_URL}/games/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        await loadGames();

    } catch (error) {

        console.error(error);

        showError(
            "Could not delete the game. Please try again."
        );
    }
}


// Cancel editing
cancelButton.addEventListener("click", () => {
    resetForm();
});


// Reset the form
function resetForm() {

    gameForm.reset();

    editingGameId = null;

    formTitle.textContent = "Add a Game";

    submitButton.textContent = "Add Game";

    cancelButton.classList.add("hidden");
}


// Search
searchInput.addEventListener(
    "input",
    applyFilters
);


// Status filter
statusFilter.addEventListener(
    "change",
    applyFilters
);


// Platform filter
platformFilter.addEventListener(
    "change",
    applyFilters
);


// Load games when page opens
loadGames();