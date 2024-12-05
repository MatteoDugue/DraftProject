let championsData = null;

// Charger les données JSON
fetch("src/data/champions.json")
    .then(response => response.json())
    .then(data => {
        championsData = data;
        console.log("Données des champions chargées : ", championsData); // Vérification des données
        // Configuration des événements
        setupEventListeners();
        // Exemple d'utilisation de la recommandation de champion après le chargement des données
        const team = [
            { name: "Lux", roles: ["Mage"], synergies: ["Zed"], counterPicks: ["Malphite"], damageType: "Magic" },
            { name: "Zed", roles: ["Assassin"], synergies: ["Lux"], counterPicks: ["Aatrox"], damageType: "Physical" }
        ];

        const enemyTeam = [
            { name: "Malphite", roles: ["Tank"], synergies: [], counterPicks: ["Lux"], damageType: "Physical" }
        ];
        // Appel de la fonction de recommandation après le chargement des données
        const recommendedChampion = recommendChampion(team, enemyTeam, championsData.champions);
        console.log("Champion recommandé : ", recommendedChampion.name);
    })
    .catch(error => console.error("Erreur lors du chargement des données :", error));

// Fonction pour configurer tous les événements
function setupEventListeners() {
    setupChampionSearch();
    setupDraftInteraction();
}

// Configuration de la recherche des champions
function setupChampionSearch() {
    const searchInput = document.getElementById("champion-search-input");
    const suggestionsList = document.getElementById("champion-suggestions-list");
    const championDetails = document.getElementById("champion-details");
    const championName = document.getElementById("champion-name");
    const championRoles = document.getElementById("champion-roles");
    const championDifficulty = document.getElementById("champion-difficulty");
    const championDamageType = document.getElementById("champion-damage-type");
    const championSynergies = document.getElementById("champion-synergies");
    const championCounterpicks = document.getElementById("champion-counterpicks");

    // Recherche dynamique de champion
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredChampions = championsData.champions.filter(champ =>
            champ.name.toLowerCase().includes(query)
        );

        // Afficher les suggestions
        suggestionsList.innerHTML = filteredChampions
            .map(champ => `<li data-name="${champ.name}">${champ.name}</li>`)
            .join("");
    });

    // Sélectionner un champion depuis les suggestions
    suggestionsList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            const selectedChampionName = event.target.textContent;
            const selectedChampion = championsData.champions.find(champ => champ.name === selectedChampionName);

            // Remplir les détails du champion
            championName.textContent = selectedChampion.name;
            championRoles.textContent = selectedChampion.roles.join(", ");
            championDifficulty.textContent = selectedChampion.difficulty;
            championDamageType.textContent = selectedChampion.damageType;

            // Afficher synergies et counterpicks
            championSynergies.innerHTML = selectedChampion.synergies.map(synergy => `<li>${synergy}</li>`).join("");
            championCounterpicks.innerHTML = selectedChampion.counterPicks.map(counter => `<li>${counter}</li>`).join("");

            // Afficher la section des détails
            championDetails.style.display = "block";
        }
    });
}

// Configuration de la gestion des cartes de rôle
function setupDraftInteraction() {
    const roleCards = document.querySelectorAll(".role-card");
    const searchInput = document.getElementById("search-input");
    const suggestionsList = document.getElementById("suggestions-list");
    let selectedRoleCard = null;

    // Ajouter un champion à une carte
    suggestionsList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            const selectedChampionName = event.target.textContent;
            const selectedChampion = championsData.champions.find(champ => champ.name === selectedChampionName);

            if (selectedRoleCard) {
                selectedRoleCard.textContent = selectedChampionName;
                selectedRoleCard.dataset.roles = selectedChampion.roles.join(", ");
                selectedRoleCard.classList.add("assigned");

                // Déterminer l'équipe et appliquer la couleur
                if (selectedRoleCard.closest(".allies")) {
                    selectedRoleCard.classList.remove("selected");
                    selectedRoleCard.classList.add("ally");
                    selectedRoleCard.style.backgroundColor = "#004d00"; // Vert foncé
                } else if (selectedRoleCard.closest(".enemies")) {
                    selectedRoleCard.classList.remove("selected");
                    selectedRoleCard.classList.add("enemy");
                    selectedRoleCard.style.backgroundColor = "#8c0000"; // Rouge foncé
                }

                // Réinitialiser la sélection
                selectedRoleCard = null;
                searchInput.value = "";
                suggestionsList.innerHTML = "";
            } else {
                alert("Veuillez sélectionner une carte avant d'attribuer un champion.");
            }
        }
    });

    // Gérer la sélection d'une carte
    roleCards.forEach(card => {
        card.addEventListener("click", () => {
            if (selectedRoleCard) {
                selectedRoleCard.classList.remove("selected");
            }
            selectedRoleCard = card;
            selectedRoleCard.classList.add("selected");
        });
    });

    // Recherche dynamique pour les cartes de rôle
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredChampions = championsData.champions.filter(champ =>
            champ.name.toLowerCase().includes(query)
        );

        // Afficher les suggestions
        suggestionsList.innerHTML = filteredChampions
            .map(champ => `<li data-name="${champ.name}">${champ.name}</li>`)
            .join("");
    });
}







// Fonction pour évaluer un champion
function evaluateChampion(champion, team, enemyTeam) {
    let score = 0;

    // 1. Évaluation des synergies
    champion.synergies.forEach(synergy => {
        if (team.some(champ => champ.name === synergy)) {
            score += 5;  // Ajouter des points pour chaque synergie trouvée
        }
    });

    // 2. Évaluation des contre-picks
    champion.counterPicks.forEach(counter => {
        if (enemyTeam.some(champ => champ.name === counter)) {
            score -= 5;  // Retirer des points si le champion est un contre-pick
        }
    });

    // 3. Évaluation des rôles manquants (s'il n'y a pas de champion avec ce rôle)
    if (!team.some(champ => champ.roles.includes(champion.roles))) {
        score += 3;  // Ajouter des points si le rôle du champion est manquant
    }

    // 4. Bonus pour le type de dégâts (si l'équipe a besoin de plus de dégâts physiques ou magiques)
    if (champion.damageType === 'Magic') {
        score += 2;  // Bonus pour les dégâts magiques
    } else if (champion.damageType === 'Physical') {
        score += 2;  // Bonus pour les dégâts physiques
    }

    return score;
}


// Fonction pour recommander un champion
function recommendChampion(team, enemyTeam, availableChampions) {
    let bestChampion = null;
    let highestScore = -Infinity;

    availableChampions.forEach(champion => {
        const score = evaluateChampion(champion, team, enemyTeam);
        if (score > highestScore) {
            highestScore = score;
            bestChampion = champion;
        }
    });

    return bestChampion;
}

// Exemple d'utilisation de la recommandation de champion
const availableChampions = championsData.champions;  // Assurez-vous que championsData est bien chargé

const recommendedChampion = recommendChampion(team, enemyTeam, availableChampions);
console.log("Champion recommandé : ", recommendedChampion.name);
