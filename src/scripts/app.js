let championsData = null;

// Charger les données JSON
fetch("src/data/champions.json")
    .then(response => response.json())
    .then(data => {
        championsData = data;
        setupEventListeners();
    })
    .catch(error => console.error("Erreur lors du chargement des données :", error));

// Configurer les événements
function setupEventListeners() {
    const searchInput = document.getElementById("search-input");
    const suggestionsList = document.getElementById("suggestions-list");
    const roleCards = document.querySelectorAll(".role-card");

    let selectedRoleCard = null; // Référence à la carte sélectionnée

    // Recherche dynamique
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredChampions = championsData.champions.filter(champ =>
            champ.name.toLowerCase().includes(query) // On filtre par nom de champion
        );

        suggestionsList.innerHTML = filteredChampions
            .map(champ => `<li data-name="${champ.name}">${champ.name}</li>`) // Ajout d'un attribut data-name pour faciliter l'accès
            .join("");
    });

    // Cacher les suggestions si on clique en dehors de la barre de recherche
    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.innerHTML = "";
        }
    });

    // Sélectionner un champion depuis les suggestions
    suggestionsList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            const selectedChampionName = event.target.textContent;
            const selectedChampion = championsData.champions.find(champ => champ.name === selectedChampionName);

            // Remplir la barre de recherche avec le nom du champion cliqué
            searchInput.value = selectedChampionName;

            // Effacer les suggestions après le clic
            suggestionsList.innerHTML = "";

            if (selectedRoleCard) {
                // Ajouter le champion à la carte sélectionnée
                selectedRoleCard.textContent = `${selectedChampionName}`;

                // Afficher le rôle du champion (en fonction de ses rôles définis dans le JSON)
                selectedRoleCard.dataset.roles = selectedChampion.roles.join(", "); // Ajout des rôles du champion en data-attribute

                // Déterminer l'équipe et changer la couleur de la carte
                if (selectedRoleCard.closest(".allies")) {
                    selectedRoleCard.classList.remove("selected");
                    selectedRoleCard.classList.add("ally");
                } else if (selectedRoleCard.closest(".enemies")) {
                    selectedRoleCard.classList.remove("selected");
                    selectedRoleCard.classList.add("enemy");
                }

                // Réinitialiser la carte sélectionnée
                selectedRoleCard = null;
            } else {
                alert("Veuillez sélectionner une carte avant d'attribuer un champion.");
            }
        }
    });

    // Marquer une carte comme sélectionnée
    roleCards.forEach(card => {
        card.addEventListener("click", () => {
            // Si une carte est déjà sélectionnée, retirer son style
            if (selectedRoleCard) {
                selectedRoleCard.classList.remove("selected");
            }

            // Mettre à jour la carte sélectionnée
            selectedRoleCard = card;
            selectedRoleCard.classList.add("selected");
        });
    });
}
