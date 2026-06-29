// ===============================
// Tippspiel Kickturnier 2026
// Version 1.0
// ===============================

let coins = 1000;
let wettschein = [];
const spiele = [

{
    id: 1,
    heim: "Team 1",
    gast: "Team 2",
    q1: 2.10,
    qx: 3.50,
    q2: 2.80
},

{
    id: 2,
    heim: "Team 3",
    gast: "Team 4",
    q1: 1.95,
    qx: 3.80,
    q2: 3.20
}

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
};

function wetteAuswaehlen(spielId, text, quote) {

    // Alten Tipp für dieses Spiel entfernen
    wettschein = wettschein.filter(tipp => tipp.spielId !== spielId);

    // Neuen Tipp hinzufügen
    wettschein.push({
        spielId: spielId,
        text: text,
        quote: quote
    });

    const liste = document.getElementById("wettscheinListe");
    liste.innerHTML = "";

    for (let tipp of wettschein) {
        liste.innerHTML +=
            "<p>✔️ " + tipp.text + " (" + tipp.quote.toFixed(2) + ")</p>";
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

function spieleAnzeigen(){

    const spieleListe = document.getElementById("spieleListe");

    spieleListe.innerHTML = "";

    for(let spiel of spiele){

        spieleListe.innerHTML += `

        <div class="spiel">

            <strong>${spiel.heim}</strong>

            <div class="quoten">

                <button onclick="wetteAuswaehlen(${spiel.id}, '${spiel.heim} Sieg', ${spiel.q1})">${spiel.q1.toFixed(2)}</button>

                <button onclick="wetteAuswaehlen(${spiel.id}, 'Unentschieden', ${spiel.qx})">${spiel.qx.toFixed(2)}</button>

                <button onclick="wetteAuswaehlen(${spiel.id}, '${spiel.gast} Sieg', ${spiel.q2})">${spiel.q2.toFixed(2)}</button>

            </div>

            <strong>${spiel.gast}</strong>

        </div>

        `;

    }

}
