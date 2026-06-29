// Tippspiel Kickturnier 2026

console.log("Tippspiel Kickturnier 2026 gestartet.");

function login() {
    const name = document.getElementById("name").value.trim();
    const code = document.getElementById("code").value.trim();

    if (name === "" || code === "") {
        alert("Bitte Name und Zugangscode eingeben.");
        return;
    }

    // Daten für später speichern
    localStorage.setItem("spielerName", name);
    localStorage.setItem("zugangscode", code);

    // Begrüßung
    alert("Willkommen " + name + "!");

    // Anzeige auf der Startseite ändern
    document.querySelector(".card h2").innerText = "Willkommen";
    document.querySelector(".card p").innerText = "Du bist erfolgreich angemeldet.";
}
