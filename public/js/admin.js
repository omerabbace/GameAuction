document.addEventListener("DOMContentLoaded", () => {
  // Check if user is authenticated
  const token = sessionStorage.getItem("token");
  if (!token) {
    window.location.href = "adminlogin.html";
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("admin-token");
    window.location.href = "/adminlogin.html";
  });

  // Navigation between sections
  const navBtns = document.querySelectorAll(".nav-btn");
  const sections = document.querySelectorAll(".main-content section");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons and sections
      navBtns.forEach((b) => b.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      // Add active class to clicked button and corresponding section
      btn.classList.add("active");
      document
        .getElementById(`${btn.dataset.section}-section`)
        .classList.add("active");
    });
  });

  // Platforms Management
  const platformsList = document.getElementById("platforms-list");
  const platformModal = document.getElementById("platform-modal");
  const platformForm = document.getElementById("platform-form");
  const addPlatformBtn = document.getElementById("add-platform-btn");
  const platformModalTitle = document.getElementById("platform-modal-title");
  const platformIdInput = document.getElementById("platform-id");
  const platformNameInput = document.getElementById("platform-name");

  // Fetch and display platforms
  async function fetchPlatforms() {
    try {
      const response = await fetch("/api/platforms", {
        headers: {
          Authorization: token,
        },
      });
      const platforms = await response.json();

      platformsList.innerHTML = "";
      platforms.forEach((platform) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${platform.id}</td>
                    <td>${platform.name}</td>
                    <td>
                        <button onclick="editPlatform(${platform.id}, '${platform.name}')">Edit</button>
                        <button onclick="deletePlatform(${platform.id})">Delete</button>
                    </td>
                `;
        platformsList.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching platforms:", error);
    }
  }

  // Open modal for adding platform
  addPlatformBtn.addEventListener("click", () => {
    platformModalTitle.textContent = "Add Platform";
    platformIdInput.value = "";
    platformNameInput.value = "";
    platformModal.style.display = "block";
  });

  // Platform form submission
  platformForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = platformIdInput.value;
    const name = platformNameInput.value;

    try {
      let response;
      if (id) {
        // Update existing platform
        response = await fetch(`/api/platforms/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ name }),
        });
      } else {
        // Create new platform
        response = await fetch("/api/platforms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ name }),
        });
      }

      if (response.ok) {
        platformModal.style.display = "none";
        fetchPlatforms();
        fetchGames();
      } else {
        alert("Failed to save platform");
      }
    } catch (error) {
      console.error("Error saving platform:", error);
    }
  });

  // Edit platform function
  window.editPlatform = (id, name) => {
    platformModalTitle.textContent = "Edit Platform";
    platformIdInput.value = id;
    platformNameInput.value = name;
    platformModal.style.display = "block";
  };

  // Delete platform function
  window.deletePlatform = async (id) => {
    if (confirm("Are you sure you want to delete this platform?")) {
      try {
        const response = await fetch(`/api/platforms/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        });

        if (response.ok) {
          fetchPlatforms();
          fetchGames();
        } else {
          alert("Failed to delete platform");
        }
      } catch (error) {
        console.error("Error deleting platform:", error);
      }
    }
  };

  // Games Management
  const gamesList = document.getElementById("games-list");
  const gameModal = document.getElementById("game-modal");
  const gameForm = document.getElementById("game-form");
  const addGameBtn = document.getElementById("add-game-btn");
  const gameModalTitle = document.getElementById("game-modal-title");
  const gameIdInput = document.getElementById("game-id");
  const gameNameInput = document.getElementById("game-name");
  const gamePlatformSelect = document.getElementById("game-platform");
  const gameAgeRatingInput = document.getElementById("game-age-rating");
  const gameSynopsisInput = document.getElementById("game-synopsis");

  // Fetch and populate platforms in game form dropdown
  async function populatePlatformsDropdown() {
    try {
      const response = await fetch("/api/platforms", {
        headers: {
          Authorization: token,
        },
      });
      const platforms = await response.json();

      gamePlatformSelect.innerHTML =
        '<option value="">Select Platform</option>';
      platforms.forEach((platform) => {
        const option = document.createElement("option");
        option.value = platform.id;
        option.textContent = platform.name;
        gamePlatformSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching platforms:", error);
    }
  }

  // Fetch and display games
  async function fetchGames() {
    try {
      const response = await fetch("/api/games", {
        headers: {
          Authorization: token,
        },
      });
      const games = await response.json();

      gamesList.innerHTML = "";

      games.games.forEach((game) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${game.id}</td>
                    <td>${game.name}</td>
                    <td>${game.platform_name || "N/A"}</td>
                    <td>${game.age_rating}</td>
                    <td>
                        <button onclick="editGame(${game.id}, '${game.name}', ${
          game.platform_id
        }, '${game.age_rating}', \`${game.synopsis}\`)">Edit</button>
                        <button onclick="deleteGame(${game.id})">Delete</button>
                    </td>
                `;
        gamesList.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  }

  // Open modal for adding game
  addGameBtn.addEventListener("click", () => {
    gameModalTitle.textContent = "Add Game";
    gameIdInput.value = "";
    gameNameInput.value = "";
    gamePlatformSelect.value = "";
    gameAgeRatingInput.value = "";
    gameSynopsisInput.value = "";
    gameModal.style.display = "block";
  });

  // Game form submission
  gameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = gameIdInput.value;
    const gameData = {
      name: gameNameInput.value,
      platform_id: gamePlatformSelect.value,
      age_rating: gameAgeRatingInput.value,
      synopsis: gameSynopsisInput.value,
    };

    try {
      let response;
      if (id) {
        // Update existing game
        response = await fetch(`/api/games/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(gameData),
        });
      } else {
        // Create new game
        response = await fetch("/api/games", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(gameData),
        });
      }

      if (response.ok) {
        gameModal.style.display = "none";
        fetchGames();
      } else {
        alert("Failed to save game");
      }
    } catch (error) {
      console.error("Error saving game:", error);
    }
  });

  // Edit game function
  window.editGame = (id, name, platformId, ageRating, synopsis) => {
    gameModalTitle.textContent = "Edit Game";
    gameIdInput.value = id;
    gameNameInput.value = name;
    gamePlatformSelect.value = platformId;
    gameAgeRatingInput.value = ageRating;
    gameSynopsisInput.value = synopsis;
    gameModal.style.display = "block";
  };

  // Delete game function
  window.deleteGame = async (id) => {
    if (confirm("Are you sure you want to delete this game?")) {
      try {
        const response = await fetch(`/api/games/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        });

        if (response.ok) {
          fetchGames();
        } else {
          alert("Failed to delete game");
        }
      } catch (error) {
        console.error("Error deleting game:", error);
      }
    }
  };

  // Modal close functionality
  const closeButtons = document.querySelectorAll(".close");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      platformModal.style.display = "none";
      gameModal.style.display = "none";
    });
  });

  // Initial data fetch
  fetchPlatforms();
  fetchGames();
  populatePlatformsDropdown();
});

// document.addEventListener('DOMContentLoaded', () => {
//     // Simulated data storage
//     let platforms = [];
//     let games = [];

//     // Check if user is authenticated
//     const token = localStorage.getItem('admin-token');
//     if (!token) {
//         window.location.href = '/html/admin-login.html';
//     }

//     // Logout functionality
//     const logoutBtn = document.getElementById('logout-btn');
//     logoutBtn.addEventListener('click', () => {
//         localStorage.removeItem('admin-token');
//         window.location.href = '/html/admin-login.html';
//     });

//     // Navigation between sections
//     const navBtns = document.querySelectorAll('.nav-btn');
//     const sections = document.querySelectorAll('.main-content section');

//     navBtns.forEach(btn => {
//         btn.addEventListener('click', () => {
//             // Remove active class from all buttons and sections
//             navBtns.forEach(b => b.classList.remove('active'));
//             sections.forEach(s => s.classList.remove('active'));

//             // Add active class to clicked button and corresponding section
//             btn.classList.add('active');
//             document.getElementById(`${btn.dataset.section}-section`).classList.add('active');
//         });
//     });

//     // Platforms Management
//     const platformsList = document.getElementById('platforms-list');
//     const platformModal = document.getElementById('platform-modal');
//     const platformForm = document.getElementById('platform-form');
//     const addPlatformBtn = document.getElementById('add-platform-btn');
//     const platformModalTitle = document.getElementById('platform-modal-title');
//     const platformIdInput = document.getElementById('platform-id');
//     const platformNameInput = document.getElementById('platform-name');

//     // Render platforms
//     function renderPlatforms() {
//         platformsList.innerHTML = '';
//         platforms.forEach((platform, index) => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${platform.id}</td>
//                 <td>${platform.name}</td>
//                 <td>
//                     <button onclick="editPlatform(${index})">Edit</button>
//                     <button onclick="deletePlatform(${index})">Delete</button>
//                 </td>
//             `;
//             platformsList.appendChild(row);
//         });

//         // Update platform dropdown in game form
//         updatePlatformDropdown();
//     }

//     // Open modal for adding platform
//     addPlatformBtn.addEventListener('click', () => {
//         platformModalTitle.textContent = 'Add Platform';
//         platformIdInput.value = '';
//         platformNameInput.value = '';
//         platformModal.style.display = 'block';
//     });

//     // Platform form submission
//     platformForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const id = platformIdInput.value;
//         const name = platformNameInput.value;

//         if (id) {
//             // Update existing platform
//             const index = platforms.findIndex(p => p.id === parseInt(id));
//             if (index !== -1) {
//                 platforms[index] = { id: parseInt(id), name };
//             }
//         } else {
//             // Create new platform
//             const newId = platforms.length > 0 ?
//                 Math.max(...platforms.map(p => p.id)) + 1 : 1;
//             platforms.push({ id: newId, name });
//         }

//         platformModal.style.display = 'none';
//         renderPlatforms();
//         renderGames();
//     });

//     // Edit platform function
//     window.editPlatform = (index) => {
//         const platform = platforms[index];
//         platformModalTitle.textContent = 'Edit Platform';
//         platformIdInput.value = platform.id;
//         platformNameInput.value = platform.name;
//         platformModal.style.display = 'block';
//     };

//     // Delete platform function
//     window.deletePlatform = (index) => {
//         if (confirm('Are you sure you want to delete this platform?')) {
//             platforms.splice(index, 1);
//             renderPlatforms();
//             renderGames();
//         }
//     };

//     // Games Management
//     const gamesList = document.getElementById('games-list');
//     const gameModal = document.getElementById('game-modal');
//     const gameForm = document.getElementById('game-form');
//     const addGameBtn = document.getElementById('add-game-btn');
//     const gameModalTitle = document.getElementById('game-modal-title');
//     const gameIdInput = document.getElementById('game-id');
//     const gameNameInput = document.getElementById('game-name');
//     const gamePlatformSelect = document.getElementById('game-platform');
//     const gameAgeRatingInput = document.getElementById('game-age-rating');
//     const gameSynopsisInput = document.getElementById('game-synopsis');

//     // Update platform dropdown
//     function updatePlatformDropdown() {
//         gamePlatformSelect.innerHTML = '<option value="">Select Platform</option>';
//         platforms.forEach(platform => {
//             const option = document.createElement('option');
//             option.value = platform.id;
//             option.textContent = platform.name;
//             gamePlatformSelect.appendChild(option);
//         });
//     }

//     // Render games
//     function renderGames() {
//         gamesList.innerHTML = '';
//         games.forEach((game, index) => {
//             const platform = platforms.find(p => p.id === parseInt(game.platform_id));
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${game.id}</td>
//                 <td>${game.name}</td>
//                 <td>${platform ? platform.name : 'N/A'}</td>
//                 <td>${game.age_rating}</td>
//                 <td>
//                     <button onclick="editGame(${index})">Edit</button>
//                     <button onclick="deleteGame(${index})">Delete</button>
//                 </td>
//             `;
//             gamesList.appendChild(row);
//         });
//     }

//     // Open modal for adding game
//     addGameBtn.addEventListener('click', () => {
//         gameModalTitle.textContent = 'Add Game';
//         gameIdInput.value = '';
//         gameNameInput.value = '';
//         gamePlatformSelect.value = '';
//         gameAgeRatingInput.value = '';
//         gameSynopsisInput.value = '';
//         gameModal.style.display = 'block';
//     });

//     // Game form submission
//     gameForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const id = gameIdInput.value;
//         const gameData = {
//             name: gameNameInput.value,
//             platform_id: gamePlatformSelect.value,
//             age_rating: gameAgeRatingInput.value,
//             synopsis: gameSynopsisInput.value
//         };

//         if (id) {
//             // Update existing game
//             const index = games.findIndex(g => g.id === parseInt(id));
//             if (index !== -1) {
//                 games[index] = {
//                     id: parseInt(id),
//                     ...gameData
//                 };
//             }
//         } else {
//             // Create new game
//             const newId = games.length > 0 ?
//                 Math.max(...games.map(g => g.id)) + 1 : 1;
//             games.push({
//                 id: newId,
//                 ...gameData
//             });
//         }

//         gameModal.style.display = 'none';
//         renderGames();
//     });

//     // Edit game function
//     window.editGame = (index) => {
//         const game = games[index];
//         gameModalTitle.textContent = 'Edit Game';
//         gameIdInput.value = game.id;
//         gameNameInput.value = game.name;
//         gamePlatformSelect.value = game.platform_id;
//         gameAgeRatingInput.value = game.age_rating;
//         gameSynopsisInput.value = game.synopsis;
//         gameModal.style.display = 'block';
//     };

//     // Delete game function
//     window.deleteGame = (index) => {
//         if (confirm('Are you sure you want to delete this game?')) {
//             games.splice(index, 1);
//             renderGames();
//         }
//     };

//     // Modal close functionality
//     const closeButtons = document.querySelectorAll('.close');
//     closeButtons.forEach(btn => {
//         btn.addEventListener('click', () => {
//             platformModal.style.display = 'none';
//             gameModal.style.display = 'none';
//         });
//     });

//     // Initial data setup (you can pre-populate with some sample data)
//     platforms = [
//         { id: 1, name: 'PlayStation' },
//         { id: 2, name: 'Nintendo' }
//     ];

//     games = [
//         {
//             id: 1,
//             name: 'Final Fantasy VII',
//             platform_id: 1,
//             age_rating: 'T',
//             synopsis: 'A classic RPG about Cloud Strife and his fight against Shinra and Sephiroth.'
//         },
//         {
//             id: 2,
//             name: 'Super Mario Bros',
//             platform_id: 2,
//             age_rating: 'E',
//             synopsis: 'The iconic platformer featuring Mario and Luigi saving Princess Peach.'
//         }
//     ];

//     // Initial rendering
//     renderPlatforms();
//     renderGames();
// });
