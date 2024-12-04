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

    // Recherche dynamique
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredChampions = championsData.champions.filter(champ =>
            champ.toLowerCase().includes(query)
        );

        suggestionsList.innerHTML = filteredChampions
            .map(champ => `<li>${champ}</li>`)
            .join("");
    });

    // Sélectionner un champion depuis les suggestions
    suggestionsList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            const selectedChampion = event.target.textContent;
            searchInput.value = ""; // Vider le champ de recherche
            suggestionsList.innerHTML = ""; // Vider les suggestions

            // Ajouter le champion à une carte sélectionnée
            const selectedRoleCard = document.querySelector(".role-card.selected");
            if (selectedRoleCard) {
                selectedRoleCard.textContent = selectedChampion;
                selectedRoleCard.classList.remove("selected");
            }
        }
    });

    // Marquer une carte comme sélectionnée
    roleCards.forEach(card => {
        card.addEventListener("click", () => {
            roleCards.forEach(card => card.classList.remove("selected"));
            card.classList.add("selected");
        });
    });
}
