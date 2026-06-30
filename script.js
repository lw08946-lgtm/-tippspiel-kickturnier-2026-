// ===============================
// Tippspiel Kickturnier 2026
// Version 1.0
// ===============================

let coins = 1000;
let wettschein = [];
let aktiveButtons = {};
let offeneWetten = [];
let sonderwetten = [];
let ergebnisse = {};

let spiele = [

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
    document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "none";
    document.getElementById("neueSonderwetteSeite").style.display = "none";
    document.getElementById("ergebnisseSeite").style.display = "none";
}

function zeigeSpiele() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "block";
    document.getElementById("wettscheinSeite").style.display = "none";
document.getElementById("adminSeite").style.display = "none";
    document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "none";
    document.getElementById("neueSonderwetteSeite").style.display = "none";
    document.getElementById("ergebnisseSeite").style.display = "none";
}

function zeigeWettschein() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "block";
document.getElementById("adminSeite").style.display = "none";
    document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "none";
    document.getElementById("neueSonderwetteSeite").style.display = "none";
    document.getElementById("ergebnisseSeite").style.display = "none";
}
function zeigeSonderwetten() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "none";
    document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("adminSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
document.getElementById("ergebnisseSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "block";

}
function zeigeMeineWetten() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "none";
    document.getElementById("meineWettenSeite").style.display = "block";
    document.getElementById("adminSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "none";
document.getElementById("neueSonderwetteSeite").style.display = "none";
    document.getElementById("ergebnisseSeite").style.display = "none";
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
document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "none";
    document.getElementById("neueSonderwetteSeite").style.display = "none";
    document.getElementById("ergebnisseSeite").style.display = "none";
}
function zeigeNeuesSpiel() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "none";
    document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("adminSeite").style.display = "none";
document.getElementById("sonderwettenSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "block";
document.getElementById("neueSonderwetteSeite").style.display = "none";
    document.getElementById("ergebnisseSeite").style.display = "none";
}
function zeigeNeueSonderwette() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "none";
    document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("adminSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "none";
document.getElementById("ergebnisseSeite").style.display = "none";
    document.getElementById("neueSonderwetteSeite").style.display = "block";

}
function zeigeErgebnisse() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "none";
    document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("adminSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "none";
    document.getElementById("neueSonderwetteSeite").style.display = "none";

    document.getElementById("ergebnisseSeite").style.display = "block";

    ladeErgebnisse();
    }
function ergebnisSpeichern(spielId, ergebnis) {

    ergebnisse[spielId] = ergebnis;

pruefeOffeneWetten();

    ladeErgebnisse();

    alert("✅ Ergebnis gespeichert!");

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
function wettePlatzieren() {

    if (wettschein.length === 0) {
        alert("Bitte wähle zuerst mindestens eine Wette aus.");
        return;
    }

    const einsatz =
        Number(document.getElementById("einsatz").value);

    if (!einsatz || einsatz <= 0) {
        alert("Bitte gib einen Einsatz ein.");
        return;
    }

    if (einsatz > coins) {
        alert("Du hast nicht genügend Coins.");
        return;
    }

    let gesamtquote = 1;

    for (let tipp of wettschein) {
        gesamtquote *= tipp.quote;
    }

    offeneWetten.push({

    id: Date.now(),

    tipps: [...wettschein],
    einsatz: einsatz,
    quote: gesamtquote,
    moeglicherGewinn: einsatz * gesamtquote,
    status: "🟡 Offen"

});


    coins -= einsatz;

    coinsAnzeige.innerHTML =
        "💰 " + coins + " Coins";

    aktualisiereOffeneWetten();

    wettschein = [];

    document.getElementById("wettscheinListe").innerHTML =
        "<p>Noch keine Wetten ausgewählt.</p>";

    document.getElementById("einsatz").value = "";

    document.getElementById("gesamtQuote").innerHTML = "1.00";
    document.getElementById("moeglicherGewinn").innerHTML = "0.00 Coins";

    alert("✅ Wette erfolgreich platziert!");

}

   function aktualisiereOffeneWetten() {

    const liste =
        document.getElementById("offeneWettenListe");

    liste.innerHTML = "";

    for (let wette of offeneWetten) {

let tippsHTML = "";

for (let tipp of wette.tipps) {

    tippsHTML += `
        <p>
            <strong>${tipp.spiel}</strong><br>
            ✔️ ${tipp.text}
            (${tipp.quote.toFixed(2)})
        </p>
    `;

}

liste.innerHTML += `

<div class="spiel">

    <h3>${wette.status}</h3>

    ${tippsHTML}

    <hr>

    <p><strong>Einsatz:</strong> ${wette.einsatz} Coins</p>

    <p><strong>Quote:</strong> ${wette.quote.toFixed(2)}</p>

    <p><strong>Möglicher Gewinn:</strong>
    ${wette.moeglicherGewinn.toFixed(2)} Coins</p>

</div>

`;

    }

}
function spielHinzufuegen() {

    const phase = document.getElementById("phase").value;

    const heim = document.getElementById("heimTeam").value;

    const gast = document.getElementById("gastTeam").value;

    const q1 = Number(document.getElementById("quote1").value);

    const qx = Number(document.getElementById("quoteX").value);

    const q2 = Number(document.getElementById("quote2").value);

    if (heim === "" || gast === "") {

        alert("Bitte beide Teams eingeben.");

        return;

    }

    spiele.push({

        id: spiele.length + 1,

        phase: phase,

        heim: heim,

        gast: gast,

        q1: q1,

        qx: qx,

        q2: q2,

        ergebnis: null

    });

    spieleAnzeigen();

    alert("✅ Neues Spiel hinzugefügt!");

    zeigeSpiele();

}
function sonderwetteHinzufuegen() {

    const titel = document.getElementById("sonderTitel").value;

    if (titel === "") {
        alert("Bitte einen Titel eingeben.");
        return;
    }

    const antworten = [];

    for (let i = 1; i <= 4; i++) {

        const text = document.getElementById("antwort" + i).value;
        const quote = Number(document.getElementById("quoteAntwort" + i).value);

        if (text !== "" && quote > 0) {

            antworten.push({
                text: text,
                quote: quote
            });

        }

    }

    if (antworten.length < 2) {

        alert("Mindestens zwei Antworten eingeben.");

        return;

    }

    sonderwetten.push({

        titel: titel,
        antworten: antworten

    });

    aktualisiereSonderwetten();

    alert("✅ Sonderwette gespeichert!");

}
function aktualisiereSonderwetten() {

    const liste = document.getElementById("sonderwettenListe");

    liste.innerHTML = "";

    for (let wette of sonderwetten) {

        let antwortenHTML = "";

        for (let antwort of wette.antworten) {

            antwortenHTML += `

            <button onclick="sonderwetteAuswaehlen('${wette.titel}', '${antwort.text}', ${antwort.quote})">

                ${antwort.text}
                (${antwort.quote.toFixed(2)})

            </button>

            <br><br>

            `;

        }

        liste.innerHTML += `

        <div class="spiel">

            <h3>${wette.titel}</h3>

            ${antwortenHTML}

        </div>

        `;

    }

}
function sonderwetteAuswaehlen(titel, antwort, quote) {

    wettschein.push({

        spielId: "sonder_" + titel,

        spiel: titel,

        text: antwort,

        quote: quote,

        typ: "sonder"

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
function ladeErgebnisse() {

    const liste = document.getElementById("ergebnisseListe");

    liste.innerHTML = "";

    for (let spiel of spiele) {

        const gespeichert = ergebnisse[spiel.id];

        liste.innerHTML += `

        <div class="spiel">

            <strong>${spiel.heim} - ${spiel.gast}</strong>

            <br><br>

            <button
            onclick="ergebnisSpeichern(${spiel.id}, '1')"
            style="${gespeichert === "1" ? "background:#2563eb;" : ""}">
                🏠 Heimsieg
            </button>

            <br><br>

            <button
            onclick="ergebnisSpeichern(${spiel.id}, 'X')"
            style="${gespeichert === "X" ? "background:#2563eb;" : ""}">
                🤝 Unentschieden
            </button>

            <br><br>

            <button
            onclick="ergebnisSpeichern(${spiel.id}, '2')"
            style="${gespeichert === "2" ? "background:#2563eb;" : ""}">
                ✈️ Auswärtssieg
            </button>

        </div>

        <br>

        `;

    }

}
function pruefeOffeneWetten() {

    for (let wette of offeneWetten) {

        let gewonnen = true;

        for (let tipp of wette.tipps) {

            if (tipp.spielId in ergebnisse) {

                let richtigesErgebnis = ergebnisse[tipp.spielId];

                let tippErgebnis = "";

                if (tipp.text.includes("Heim")) {
                    tippErgebnis = "1";
                } else if (tipp.text.includes("Unentschieden")) {
                    tippErgebnis = "X";
                } else {
                    tippErgebnis = "2";
                }

                if (tippErgebnis !== richtigesErgebnis) {
                    gewonnen = false;
                }

            } else {

                gewonnen = false;

            }

        }
let alleErgebnisseVorhanden = true;

for (let tipp of wette.tipps) {

    if (!(tipp.spielId in ergebnisse)) {
        alleErgebnisseVorhanden = false;
    }

}

if (gewonnen && alleErgebnisseVorhanden) {

    wette.status = "🟢 Gewonnen";

} else if (!gewonnen && alleErgebnisseVorhanden) {

    wette.status = "🔴 Verloren";

} else {

    wette.status = "🟡 Offen";

}


    aktualisiereOffeneWetten();

}
}


