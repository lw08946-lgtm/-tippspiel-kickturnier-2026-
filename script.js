// ===============================
// Tippspiel Kickturnier 2026
// Version 1.0
// ===============================

let coins = 1000;
let wettschein = [];
let aktiveButtons = {};
let offeneWetten = [];

const spiele = [

    // Gruppe A
    {id:1, heim:"Team 1", gast:"Team 2", q1:2.10, qx:3.50, q2:2.80},
    {id:2, heim:"Team 3", gast:"Team 4", q1:2.05, qx:3.40, q2:2.90},
    {id:3, heim:"Team 1", gast:"Team 3", q1:2.20, qx:3.30, q2:2.70},
    {id:4, heim:"Team 2", gast:"Team 4", q1:2.15, qx:3.45, q2:2.75},
    {id:5, heim:"Team 1", gast:"Team 4", q1:1.95, qx:3.60, q2:3.10},
    {id:6, heim:"Team 2", gast:"Team 3", q1:2.30, qx:3.25, q2:2.60},

    // Gruppe B
    {id:7, heim:"Team 5", gast:"Team 6", q1:2.10, qx:3.50, q2:2.80},
    {id:8, heim:"Team 7", gast:"Team 8", q1:2.05, qx:3.40, q2:2.90},
    {id:9, heim:"Team 5", gast:"Team 7", q1:2.20, qx:3.30, q2:2.70},
    {id:10, heim:"Team 6", gast:"Team 8", q1:2.15, qx:3.45, q2:2.75},
    {id:11, heim:"Team 5", gast:"Team 8", q1:1.95, qx:3.60, q2:3.10},
    {id:12, heim:"Team 6", gast:"Team 7", q1:2.30, qx:3.25, q2:2.60},

    // Gruppe C
    {id:13, heim:"Team 9", gast:"Team 10", q1:2.10, qx:3.50, q2:2.80},
    {id:14, heim:"Team 11", gast:"Team 12", q1:2.05, qx:3.40, q2:2.90},
    {id:15, heim:"Team 9", gast:"Team 11", q1:2.20, qx:3.30, q2:2.70},
    {id:16, heim:"Team 10", gast:"Team 12", q1:2.15, qx:3.45, q2:2.75},
    {id:17, heim:"Team 9", gast:"Team 12", q1:1.95, qx:3.60, q2:3.10},
    {id:18, heim:"Team 10", gast:"Team 11", q1:2.30, qx:3.25, q2:2.60}

];

const spielerAnzeige = document.getElementById("spieler");
const coinsAnzeige = document.getElementById("coins");
const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", login);

function login() {

    const name = document.getElementById("name").value.trim();

    if (name === "") {
        alert("Bitte gib deinen Namen ein.");
        return;
    }

    spielerAnzeige.innerHTML = "👤 " + name;
    coinsAnzeige.innerHTML = "💰 " + coins + " Coins";

    localStorage.setItem("spieler", name);

    alert("Willkommen " + name + "!");

}

window.onload = function () {

    const name = localStorage.getItem("spieler");

    if (name) {
        spielerAnzeige.innerHTML = "👤 " + name;
        coinsAnzeige.innerHTML = "💰 " + coins + " Coins";
    }

    spieleAnzeigen();
zeigeStart();
    
};

function wetteAuswaehlen(spielId, spiel, text, quote, button) {
if (aktiveButtons[spielId]) {
    aktiveButtons[spielId].style.background = "#0A2342";
}

button.style.background = "#2563eb";

aktiveButtons[spielId] = button;
    wettschein = wettschein.filter(tipp => tipp.spielId !== spielId);

    wettschein.push({
        spielId: spielId,
        spiel: spiel,
        text: text,
        quote: quote
    });

    const liste = document.getElementById("wettscheinListe");
    liste.innerHTML = "";

    for (let tipp of wettschein) {

        liste.innerHTML +=
        "<p><strong>" + tipp.spiel + "</strong><br>" +
        "✔️ " + tipp.text +
        " (" + tipp.quote.toFixed(2) + ")</p>";

    }

    berechneGewinn();

}

function berechneGewinn() {

    let gesamtquote = 1;

    for (let tipp of wettschein) {
        gesamtquote *= tipp.quote;
    }

    document.getElementById("gesamtQuote").innerHTML =
        gesamtquote.toFixed(2);

    const einsatz =
        Number(document.getElementById("einsatz").value) || 0;

    const gewinn = einsatz * gesamtquote;

    document.getElementById("moeglicherGewinn").innerHTML =
        gewinn.toFixed(2) + " Coins";

}
function spieleAnzeigen() {

    const spieleListe = document.getElementById("spieleListe");

    spieleListe.innerHTML = "";

    for (let spiel of spiele) {

        spieleListe.innerHTML += `

        <div class="spiel">

            <strong>${spiel.heim}</strong>

            <div class="quoten">

                <button onclick="wetteAuswaehlen(${spiel.id}, '${spiel.heim} - ${spiel.gast}', '${spiel.heim} Sieg', ${spiel.q1}, this)">
                    ${spiel.q1.toFixed(2)}
                </button>

                <button onclick="wetteAuswaehlen(${spiel.id}, '${spiel.heim} - ${spiel.gast}', 'Unentschieden', ${spiel.qx}, this)">
                    ${spiel.qx.toFixed(2)}
                </button>

                <button onclick="wetteAuswaehlen(${spiel.id}, '${spiel.heim} - ${spiel.gast}', '${spiel.gast} Sieg', ${spiel.q2}, this)">
                    ${spiel.q2.toFixed(2)}
                </button>

            </div>

            <strong>${spiel.gast}</strong>

        </div>

        `;

    }



}
function zeigeStart() {

    document.getElementById("startSeite").style.display = "block";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "none";
document.getElementById("adminSeite").style.display = "none";
}

function zeigeSpiele() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "block";
    document.getElementById("wettscheinSeite").style.display = "none";
document.getElementById("adminSeite").style.display = "none";
}

function zeigeWettschein() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "block";
document.getElementById("adminSeite").style.display = "none";
}

function zeigeAdmin() {

    const passwort = prompt("Admin-Passwort:");

    if (passwort !== "1234") {
        alert("Falsches Passwort!");
        return;
    }

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "none";
    document.getElementById("adminSeite").style.display = "block";

}
function teamsSpeichern() {

    const teams = [];

    for (let i = 1; i <= 12; i++) {
        teams[i] = document.getElementById("team" + i).value || ("Team " + i);
    }

    // Gruppe A
    spiele[0].heim = teams[1];
    spiele[0].gast = teams[2];

    spiele[1].heim = teams[3];
    spiele[1].gast = teams[4];

    spiele[2].heim = teams[1];
    spiele[2].gast = teams[3];

    spiele[3].heim = teams[2];
    spiele[3].gast = teams[4];

    spiele[4].heim = teams[1];
    spiele[4].gast = teams[4];

    spiele[5].heim = teams[2];
    spiele[5].gast = teams[3];

    // Gruppe B
    spiele[6].heim = teams[5];
    spiele[6].gast = teams[6];

    spiele[7].heim = teams[7];
    spiele[7].gast = teams[8];

    spiele[8].heim = teams[5];
    spiele[8].gast = teams[7];

    spiele[9].heim = teams[6];
    spiele[9].gast = teams[8];

    spiele[10].heim = teams[5];
    spiele[10].gast = teams[8];

    spiele[11].heim = teams[6];
    spiele[11].gast = teams[7];

    // Gruppe C
    spiele[12].heim = teams[9];
    spiele[12].gast = teams[10];

    spiele[13].heim = teams[11];
    spiele[13].gast = teams[12];

    spiele[14].heim = teams[9];
    spiele[14].gast = teams[11];

    spiele[15].heim = teams[10];
    spiele[15].gast = teams[12];

    spiele[16].heim = teams[9];
    spiele[16].gast = teams[12];

    spiele[17].heim = teams[10];
    spiele[17].gast = teams[11];

    spieleAnzeigen();

    alert("Alle Teams gespeichert!");

}
