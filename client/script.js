// Tippspiel Kickturnier 2026

console.log("Tippspiel Kickturnier 2026 gestartet.");

function login() {
    const name = document.getElementById("name").value;
    const code = document.getElementById("code").value;

    if (name === "" || code === "") {
        alert("Bitte Name und Zugangscode eingeben.");
        return;
    }

    alert("Willkommen " + name + "!");
}
