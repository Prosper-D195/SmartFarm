document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. GESTION DU MENU ET DE LA NAVIGATION
    // ==========================================
    const menuItems = document.querySelectorAll(".menu-item");
    const sections = document.querySelectorAll(".content-section");

    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Retirer l'activation actuelle
            menuItems.forEach(i => i.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            // Activer le nouvel onglet
            item.classList.add("active");
            const targetId = item.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");
        });
    });

    // ==========================================
    // 2. INITIALISATION ET CHARGEMENT DU DASHBOARD
    // ==========================================
    let chartRecoltes, chartIntrants;
    initGraphiques();
    chargerDonneesApplication(); // Charge tout au démarrage

    function initGraphiques() {
        const ctxRecoltes = document.getElementById('recoltesChart').getContext('2d');
        chartRecoltes = new Chart(ctxRecoltes, {
            type: 'line',
            data: {
                labels: [], // Rempli dynamiquement
                datasets: [{
                    label: 'Volume récolté (kg)',
                    data: [],
                    borderColor: '#1e3f20',
                    backgroundColor: 'rgba(30, 63, 32, 0.05)',
                    tension: 0.3,
                    fill: true
                }]
            }
        });

        const ctxIntrants = document.getElementById('intrantsChart').getContext('2d');
        chartIntrants = new Chart(ctxIntrants, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Quantité Disponible',
                    data: [],
                    backgroundColor: '#2e6f40'
                }]
            },
            options: { responsive: true }
        });
    }

    async function chargerDonneesApplication() {
        await fetchCultures();
        await fetchRecoltes();
        await fetchIntrants();
    }

    // ==========================================
    // 3. LOGIQUE "SUIVI DES CULTURES"
    // ==========================================
    const formCulture = document.getElementById("form-culture");
    
    formCulture.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            nom: document.getElementById("cult-nom").value,
            variete: document.getElementById("cult-variete").value,
            quantite: parseInt(document.getElementById("cult-quantite").value)
        };

        try {
            const res = await fetch("/api/cultures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                formCulture.reset();
                fetchCultures(); // Rafraîchit la liste et les menus de sélection
            }
        } catch (err) { console.error("Erreur ajout culture:", err); }
    });

    async function fetchCultures() {
        try {
            const res = await fetch("/api/cultures");
            const data = await res.json();
            
            const tbody = document.getElementById("table-cultures-body");
            const selectRecolte = document.getElementById("rec-culture-id");
            
            tbody.innerHTML = "";
            selectRecolte.innerHTML = '<option value="">Sélectionner la culture...</option>';

            data.forEach(cult => {
                // Remplissage du tableau
                tbody.innerHTML += `
                    <tr>
                        <td>${cult.nom}</td>
                        <td>${cult.variete}</td>
                        <td>${cult.quantite}</td>
                        <td><button class="btn-delete" onclick="supprimerCulture(${cult.id})"><i class="fa-solid fa-trash"></i></button></td>
                    </tr>
                `;
                // Remplissage du menu déroulant de la section Récolte
                selectRecolte.innerHTML += `<option value="${cult.id}">${cult.nom} (${cult.variete})</option>`;
            });
        } catch (err) { console.error("Erreur récupération cultures:", err); }
    }

    // Déclaration globale pour permettre l'appel inline via le bouton HTML
    window.supprimerCulture = async (id) => {
        if (!confirm("Supprimer cette culture ?")) return;
        try {
            const res = await fetch(`/api/cultures/${id}`, { method: "DELETE" });
            if (res.ok) fetchCultures();
        } catch (err) { console.error("Erreur suppression:", err); }
    };

    // ==========================================
    // 4. LOGIQUE "SUIVI DES RÉCOLTES"
    // ==========================================
    const formRecolte = document.getElementById("form-recolte");

    formRecolte.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            culture_id: document.getElementById("rec-culture-id").value,
            poids: parseFloat(document.getElementById("rec-poids").value),
            date_recolte: document.getElementById("rec-date").value
        };

        try {
            const res = await fetch("/api/recoltes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                formRecolte.reset();
                fetchRecoltes();
            }
        } catch (err) { console.error("Erreur enregistrement récolte:", err); }
    });

    async function fetchRecoltes() {
        try {
            const res = await fetch("/api/recoltes");
            const data = await res.json();
            const tbody = document.getElementById("table-recoltes-body");
            tbody.innerHTML = "";

            let labels = [];
            let valeurs = [];

            data.forEach(rec => {
                const dateFormatee = new Date(rec.date_recolte).toLocaleDateString('fr-FR');
                tbody.innerHTML += `<tr><td>${rec.culture_nom || 'Culture'}</td><td>${rec.poids}</td><td>${dateFormatee}</td></tr>`;
                
                labels.push(dateFormatee);
                valeurs.push(rec.poids);
            });

            // Mise à jour en temps réel du graphique linéaire
            chartRecoltes.data.labels = labels.reverse().slice(0, 7); // Les 7 dernières entrées
            chartRecoltes.data.datasets[0].data = valeurs.reverse().slice(0, 7);
            chartRecoltes.update();
        } catch (err) { console.error("Erreur de chargement des récoltes:", err); }
    }

    // ==========================================
    // 5. LOGIQUE "INVENTAIRE DES INTRANTS"
    // ==========================================
    const formIntrant = document.getElementById("form-intrant");

    formIntrant.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {
            nom: document.getElementById("int-nom").value,
            type: document.getElementById("int-type").value,
            quantite: parseFloat(document.getElementById("int-quantite").value),
            unite: document.getElementById("int-unite").value
        };

        try {
            const res = await fetch("/api/intrants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                formIntrant.reset();
                fetchIntrants();
            }
        } catch (err) { console.error("Erreur enregistrement intrant:", err); }
    });

    async function fetchIntrants() {
        try {
            const res = await fetch("/api/intrants");
            const data = await res.json();
            const tbody = document.getElementById("table-intrants-body");
            tbody.innerHTML = "";

            let labels = [];
            let stocks = [];

            data.forEach(item => {
                tbody.innerHTML += `<tr><td>${item.nom}</td><td>${item.type}</td><td>${item.quantite}</td><td>${item.unite}</td></tr>`;
                labels.push(item.nom);
                stocks.push(item.quantite);
            });

            // Mise à jour du graphique en barres
            chartIntrants.data.labels = labels;
            chartIntrants.data.datasets[0].data = stocks;
            chartIntrants.update();
        } catch (err) { console.error("Erreur de chargement du magasin:", err); }
    }

    // ==========================================
    // 6. MODULE CENTRAL : DIAGNOSTIC IA (CONSERVÉ)
    // ==========================================
    const form = document.getElementById("form-diagnostic");
    const fileInput = document.getElementById("image-culture");
    const dropZone = document.getElementById("drop-zone");
    const previewContainer = document.getElementById("preview-container");
    const imagePreview = document.getElementById("image-preview");
    const btnAnalyser = document.getElementById("btn-analyser");

    const placeholder = document.getElementById("ia-placeholder");
    const loader = document.getElementById("ia-loader");
    const blocErreur = document.getElementById("bloc-erreur");
    const blocResultat = document.getElementById("bloc-resultat-ia");

    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) { afficherApercuImage(file); }
    });

    function afficherApercuImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            previewContainer.style.display = "block";
            btnAnalyser.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (!file) return;

        placeholder.style.display = "none";
        blocErreur.style.display = "none";
        blocResultat.style.display = "none";
        loader.style.display = "flex";
        btnAnalyser.disabled = true;

        const formData = new FormData();
        formData.append("image_culture", file);

        try {
            const response = await fetch("/api/vision/analyse", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            loader.style.display = "none";
            btnAnalyser.disabled = false;

            if (response.ok && result.status === "success") {
                afficherResultatUI(result.data);
            } else {
                afficherErreurUI(result.message || "Une erreur est survenue lors du diagnostic.");
            }
        } catch (error) {
            console.error("[L'AIGLE ROYAL] Erreur réseau :", error);
            loader.style.display = "none";
            btnAnalyser.disabled = false;
            afficherErreurUI("Impossible de contacter le serveur de diagnostic.");
        }
    });

    function afficherResultatUI(data) {
        blocResultat.innerHTML = `
            <div class="diagnostic-result-wrapper">
                <div class="result-badge">Diagnostic Validé • ${data.certitude_ia}</div>
                <div class="result-row"><span class="label">Culture détectée :</span><span class="value culture-name">${data.culture_detectee}</span></div>
                <div class="result-row"><span class="label">Pathologie / Anomalie :</span><span class="value anomaly-name">${data.anomalie_detectee}</span></div>
                <div class="result-block"><h4>Symptômes cliniques observés</h4><p>${data.symptomes_observes}</p></div>
                <div class="result-block"><h4>Protocole de traitement recommandé</h4><ul class="solutions-list">${data.solutions_proposees.map(sol => `<li>${sol}</li>`).join('')}</ul></div>
            </div>
        `;
        blocResultat.style.display = "block";
    }

    function afficherErreurUI(message) {
        blocErreur.textContent = message;
        blocErreur.style.display = "block";
    }
});