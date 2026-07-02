// Firebase initialisieren
const firebaseConfig = {
    apiKey: "AIzaSyCH70NtQj4o_3cAZPFG-v_Kqs6SDqWBjBc",
    authDomain: "tippspiel-kickturnier.firebaseapp.com",
    projectId: "tippspiel-kickturnier",
    storageBucket: "tippspiel-kickturnier.firebasestorage.app",
    messagingSenderId: "1006490909522",
    appId: "1:1006490909522:web:8bd455874f2c852c72d88b"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
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
let aktuellerSpieler = "";
let ausgezahlteWetten = [];
let spielerliste = [];

let spiele = [

    // Gruppe A
    {id:1, heim:"Team 1", gast:"Team 2", q1:2.10, qx:3.50, q2:2.80, gesperrt:false},
    {id:2, heim:"Team 3", gast:"Team 4", q1:2.05, qx:3.40, q2:2.90, gesperrt:false},
    {id:3, heim:"Team 1", gast:"Team 3", q1:2.20, qx:3.30, q2:2.70, gesperrt:false},
    {id:4, heim:"Team 2", gast:"Team 4", q1:2.15, qx:3.45, q2:2.75, gesperrt:false},
    {id:5, heim:"Team 1", gast:"Team 4", q1:1.95, qx:3.60, q2:3.10, gesperrt:false},
    {id:6, heim:"Team 2", gast:"Team 3", q1:2.30, qx:3.25, q2:2.60, gesperrt:false},

    // Gruppe B
    {id:7, heim:"Team 5", gast:"Team 6", q1:2.10, qx:3.50, q2:2.80, gesperrt:false},
    {id:8, heim:"Team 7", gast:"Team 8", q1:2.05, qx:3.40, q2:2.90, gesperrt:false},
    {id:9, heim:"Team 5", gast:"Team 7", q1:2.20, qx:3.30, q2:2.70, gesperrt:false},
    {id:10, heim:"Team 6", gast:"Team 8", q1:2.15, qx:3.45, q2:2.75, gesperrt:false},
    {id:11, heim:"Team 5", gast:"Team 8", q1:1.95, qx:3.60, q2:3.10, gesperrt:false},
    {id:12, heim:"Team 6", gast:"Team 7", q1:2.30, qx:3.25, q2:2.60, gesperrt:false},

    // Gruppe C
    {id:13, heim:"Team 9", gast:"Team 10", q1:2.10, qx:3.50, q2:2.80, gesperrt:false},
    {id:14, heim:"Team 11", gast:"Team 12", q1:2.05, qx:3.40, q2:2.90, gesperrt:false},
    {id:15, heim:"Team 9", gast:"Team 11", q1:2.20, qx:3.30, q2:2.70, gesperrt:false},
    {id:16, heim:"Team 10", gast:"Team 12", q1:2.15, qx:3.45, q2:2.75, gesperrt:false},
    {id:17, heim:"Team 9", gast:"Team 12", q1:1.95, qx:3.60, q2:3.10, gesperrt:false},
    {id:18, heim:"Team 10", gast:"Team 11", q1:2.30, qx:3.25, q2:2.60, gesperrt:false}

];

const spielerAnzeige = document.getElementById("spieler");
const coinsAnzeige = document.getElementById("coins");
const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", login);

async function login() {

    const name = document.getElementById("name").value.trim();

    if (name === "") {
        alert("Bitte gib deinen Namen ein.");
        return;
    }

    aktuellerSpieler = name;

    if (!spielerliste.includes(name)) {

        spielerliste.push(name);

        localStorage.setItem(
            "spielerliste",
            JSON.stringify(spielerliste)
        );

    }

    try {

        const doc = await db.collection("spieler")
            .doc(name)
            .get();

        if (doc.exists) {

            const spieler = doc.data();

            coins = spieler.coins || 1000;
            offeneWetten = spieler.offeneWetten || [];
            // Sonderwetten werden jetzt global aus Firestore geladen
            ergebnisse = spieler.ergebnisse || {};
            ausgezahlteWetten = spieler.ausgezahlteWetten || [];

        } else {

            coins = 1000;
            offeneWetten = [];
            sonderwetten = [];
            ergebnisse = {};
            ausgezahlteWetten = [];

            await speichereSpielerOnline();

        }

        spielerAnzeige.innerHTML = "👤 " + name;
        coinsAnzeige.innerHTML = "💰 " + coins + " Coins";

        localStorage.setItem("letzterSpieler", name);

        aktualisiereOffeneWetten();
        aktualisiereSonderwetten();
        ladeSpielerOnline(name);
        alert("Willkommen " + name + "!");

    } catch (error) {

        alert(
            "❌ Fehler beim Laden des Spielers:\n" +
            error.message
        );

    }

}
function wetteAuswaehlen(spielId, spiel, text, ergebnis, quote, button) {

    const aktuellesSpiel = spiele.find(s => s.id === spielId);

    if (aktuellesSpiel.gesperrt) {

        alert("⛔ Die Wettannahme für dieses Spiel ist geschlossen.");

        return;

    }

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
        ergebnis: ergebnis,
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

                <button onclick="wetteAuswaehlen(${spiel.id}, '${spiel.heim} - ${spiel.gast}', '${spiel.heim} Sieg', '1', ${spiel.q1}, this)">
                    ${spiel.q1.toFixed(2)}
                </button>

                <button onclick="wetteAuswaehlen(${spiel.id}, '${spiel.heim} - ${spiel.gast}', 'Unentschieden', 'X', ${spiel.qx}, this)">
                    ${spiel.qx.toFixed(2)}
                </button>

                <button onclick="wetteAuswaehlen(${spiel.id}, '${spiel.heim} - ${spiel.gast}', '${spiel.gast} Sieg', '2', ${spiel.q2}, this)">
                    ${spiel.q2.toFixed(2)}
                </button>

            </div>

            <strong>${spiel.gast}</strong>

        </div>

        `;

    }

}
function teamEingabefelderAktualisieren() {

    document.getElementById("team1").value = spiele[0].heim;
    document.getElementById("team2").value = spiele[0].gast;
    document.getElementById("team3").value = spiele[1].heim;
    document.getElementById("team4").value = spiele[1].gast;

    document.getElementById("team5").value = spiele[6].heim;
    document.getElementById("team6").value = spiele[6].gast;
    document.getElementById("team7").value = spiele[7].heim;
    document.getElementById("team8").value = spiele[7].gast;

    document.getElementById("team9").value = spiele[12].heim;
    document.getElementById("team10").value = spiele[12].gast;
    document.getElementById("team11").value = spiele[13].heim;
    document.getElementById("team12").value = spiele[13].gast;

}
function zeigeCoinsAufladen() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "none";
    document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("adminSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "none";
    document.getElementById("neueSonderwetteSeite").style.display = "none";
    document.getElementById("ergebnisseSeite").style.display = "none";
    document.getElementById("quotenSeite").style.display = "none";
    ladeSpielerliste();
    document.getElementById("coinsSeite").style.display = "block";
    document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("adminSonderwettenSeite").style.display = "none";
}
function zeigeQuoten() {

    document.getElementById("startSeite").style.display = "none";
    document.getElementById("spieleSeite").style.display = "none";
    document.getElementById("wettscheinSeite").style.display = "none";
    document.getElementById("meineWettenSeite").style.display = "none";
    document.getElementById("adminSeite").style.display = "none";
    document.getElementById("neuesSpielSeite").style.display = "none";
    document.getElementById("sonderwettenSeite").style.display = "none";
    document.getElementById("neueSonderwetteSeite").style.display = "none";
    document.getElementById("ergebnisseSeite").style.display = "none";
    document.getElementById("quotenSeite").style.display = "block";
    document.getElementById("adminSonderwettenSeite").style.display = "none";

    ladeQuoten();

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
    document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("adminSonderwettenSeite").style.display = "none";
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
    document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("adminSonderwettenSeite").style.display = "none";
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
    document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("adminSonderwettenSeite").style.display = "none";
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
document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("adminSonderwettenSeite").style.display = "none";
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
    document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("adminSonderwettenSeite").style.display = "none";
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
    document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("adminSonderwettenSeite").style.display = "block";

    aktualisiereAdminSonderwetten();

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
    document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("adminSonderwettenSeite").style.display = "none";
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
document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("adminSonderwettenSeite").style.display = "none";
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
document.getElementById("quotenSeite").style.display = "none";
    document.getElementById("ergebnisseSeite").style.display = "block";
    document.getElementById("adminSonderwettenSeite").style.display = "none";

    ladeErgebnisse();
    }
function ergebnisSpeichern(spielId, ergebnis) {

    ergebnisse[spielId] = ergebnis;
speichereErgebnisseOnline();
pruefeOffeneWetten();

    ladeErgebnisse();
speichernSpieler();
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

speichereTeamsOnline();

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
speichernSpieler();
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
async function sonderwetteHinzufuegen() {

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

    await speichereSonderwettenOnline();

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

    // Bereits gewählte Sonderwette ersetzen
    wettschein = wettschein.filter(tipp => tipp.spielId !== "sonder_" + titel);

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
async function sonderwetteLoeschen(index) {

    if (!confirm("Sonderwette wirklich löschen?")) {
        return;
    }

    sonderwetten.splice(index, 1);

    await speichereSonderwettenOnline();

    aktualisiereSonderwetten();
    aktualisiereAdminSonderwetten();

    alert("✅ Sonderwette gelöscht");

}
function aktualisiereAdminSonderwetten() {

    const liste = document.getElementById("adminSonderwettenListe");

    if (!liste) return;

    liste.innerHTML = "";

    sonderwetten.forEach((wette, index) => {

        let antworten = "";

        if (!wette.ausgewertet) {

            wette.antworten.forEach((antwort) => {

                antworten += `

                <button onclick="sonderwetteAuswerten(${index}, '${antwort.text}')">
                    ✅ ${antwort.text}
                </button>

                <br><br>

                `;

            });

        } else {

            antworten = `

                <p style="color:lime;">
                    ✅ Ausgewertet
                </p>

                <p>
                    Richtige Antwort:
                    <strong>${wette.richtigeAntwort}</strong>
                </p>

            `;

        }

        liste.innerHTML += `

        <div class="spiel">

            <h3>${wette.titel}</h3>

            ${antworten}

            <button onclick="sonderwetteLoeschen(${index})">
                🗑️ Löschen
            </button>

        </div>

        <br>

        `;

    });

}
async function sonderwetteAuswerten(index, richtigeAntwort) {

    if (!confirm("Soll '" + richtigeAntwort + "' als richtige Antwort gewertet werden?")) {
        return;
    }

    sonderwetten[index].richtigeAntwort = richtigeAntwort;
    sonderwetten[index].ausgewertet = true;

    await speichereSonderwettenOnline();

    const snapshot = await db.collection("spieler").get();

    for (const doc of snapshot.docs) {

        const spieler = doc.data();

        if (!spieler.offeneWetten) continue;

        if (!spieler.ausgezahlteWetten)
            spieler.ausgezahlteWetten = [];

        let geaendert = false;

        for (let wette of spieler.offeneWetten) {

            let gewonnen = true;
            let sonderGefunden = false;

            for (let tipp of wette.tipps) {

                if (tipp.typ !== "sonder")
                    continue;

                if (tipp.spiel !== sonderwetten[index].titel)
                    continue;

                sonderGefunden = true;

                if (tipp.text !== richtigeAntwort) {

                    gewonnen = false;

                }

            }

            if (!sonderGefunden)
                continue;

            if (spieler.ausgezahlteWetten.includes(wette.id))
                continue;

            if (gewonnen) {

                wette.status = "🟢 Gewonnen";
                spieler.coins += wette.moeglicherGewinn;

            } else {

                wette.status = "🔴 Verloren";

            }

            spieler.ausgezahlteWetten.push(wette.id);

            geaendert = true;

        }

        if (geaendert) {

            await db.collection("spieler")
                .doc(doc.id)
                .update({

                    coins: spieler.coins,
                    offeneWetten: spieler.offeneWetten,
                    ausgezahlteWetten: spieler.ausgezahlteWetten

                });

        }

    }

    aktualisiereAdminSonderwetten();

    alert("✅ Sonderwette ausgewertet.");

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
        let alleErgebnisseVorhanden = true;

        for (let tipp of wette.tipps) {

            if (!(tipp.spielId in ergebnisse)) {
                alleErgebnisseVorhanden = false;
                continue;
            }

            if (tipp.ergebnis !== ergebnisse[tipp.spielId]) {
                gewonnen = false;
            }

        }

        if (gewonnen && alleErgebnisseVorhanden) {

            wette.status = "🟢 Gewonnen";

            if (!ausgezahlteWetten.includes(wette.id)) {

                coins += wette.moeglicherGewinn;

                coinsAnzeige.innerHTML =
                    "💰 " + coins + " Coins";

                ausgezahlteWetten.push(wette.id);

                speichernSpieler();

                alert("🎉 Du hast " +
                      wette.moeglicherGewinn.toFixed(2) +
                      " Coins gewonnen!");

            }

        } else if (!gewonnen && alleErgebnisseVorhanden) {

            wette.status = "🔴 Verloren";

        } else {

            wette.status = "🟡 Offen";

        }

    }

    aktualisiereOffeneWetten();

}
function ladeQuoten() {

    const liste = document.getElementById("quotenListe");

    liste.innerHTML = "";

    for (let spiel of spiele) {

        liste.innerHTML += `

        <div class="spiel">

            <strong>${spiel.heim} - ${spiel.gast}</strong>

            <br><br>

            Heimsieg:
            <input
                id="q1_${spiel.id}"
                type="number"
                step="0.01"
                value="${spiel.q1}">

            <br><br>

            Unentschieden:
            <input
                id="qx_${spiel.id}"
                type="number"
                step="0.01"
                value="${spiel.qx}">

            <br><br>

            Auswärtssieg:
            <input
                id="q2_${spiel.id}"
                type="number"
                step="0.01"
                value="${spiel.q2}">

            <br><br>

            <button onclick="quoteSpeichern(${spiel.id})">
                💾 Quoten speichern
            </button>

            <br><br>

            <button onclick="spielSperren(${spiel.id})">
                ${spiel.gesperrt ? "🔴 Wettannahme geschlossen" : "🟢 Wettannahme geöffnet"}
            </button>

        </div>

        <br>

        `;

    }

}
function quoteSpeichern(spielId) {

    const spiel = spiele.find(s => s.id === spielId);

    spiel.q1 = Number(document.getElementById("q1_" + spielId).value);
    spiel.qx = Number(document.getElementById("qx_" + spielId).value);
    spiel.q2 = Number(document.getElementById("q2_" + spielId).value);
speichereQuotenOnline();
    spieleAnzeigen();
speichernSpieler();
    alert("✅ Quoten gespeichert!");

}
async function spielSperren(spielId) {

    const spiel = spiele.find(s => s.id === spielId);

    spiel.gesperrt = !spiel.gesperrt;

    await speichereQuotenOnline();

    ladeQuoten();

    spieleAnzeigen();

}

function speichernSpieler() {


    if (aktuellerSpieler === "") {
        alert("Kein aktueller Spieler!");
        return;
    }

    const spieler = {

        coins: coins,
        offeneWetten: offeneWetten,
        sonderwetten: sonderwetten,
        ergebnisse: ergebnisse,
        ausgezahlteWetten: ausgezahlteWetten

    };

    localStorage.setItem(
        "spieler_" + aktuellerSpieler,
        JSON.stringify(spieler)
    );

    speichereSpielerOnline();

}
async function coinsAufladen() {

    const name = document.getElementById("coinsSpieler").value.trim();
    const euro = Number(document.getElementById("euroBetrag").value);

    if (name === "") {
        alert("Bitte Spielernamen eingeben.");
        return;
    }

    if (!euro || euro <= 0) {
        alert("Bitte gültigen Eurobetrag eingeben.");
        return;
    }

    try {

        const ref = db.collection("spieler").doc(name);

        const doc = await ref.get();

        if (!doc.exists) {
            alert("Spieler nicht gefunden.");
            return;
        }

        const spieler = doc.data();

        const coins = euro * 100;

        spieler.coins += coins;

        await ref.update({
            coins: spieler.coins
        });

        alert(
            "✅ " + name + " hat " +
            coins + " Coins erhalten."
        );

    } catch (error) {

        alert("❌ Fehler: " + error.message);

    }

}
function ladeSpielerliste() {

    const auswahl = document.getElementById("coinsSpieler");

    auswahl.innerHTML = "";

    for (let name of spielerliste) {

        auswahl.innerHTML += `
            <option value="${name}">
                ${name}
            </option>
        `;

    }

}
async function speichereTeamsOnline() {

    console.log("Spiele:", spiele);

    try {

        await db.collection("turnier")
            .doc("teams")
            .set({
                spiele: spiele
            });


    } catch (error) {

        alert(
            "Code: " + error.code +
            "\nNachricht: " + error.message
        );

        console.error(error);

    }

}
function ladeTeamsOnline() {

    db.collection("turnier")
        .doc("teams")
        .onSnapshot((doc) => {

            if (!doc.exists) return;

            spiele = doc.data().spiele;

            spieleAnzeigen();

            teamEingabefelderAktualisieren();

        }, (error) => {

            alert("❌ Fehler beim Laden der Teams: " + error.message);

        });

}
async function speichereErgebnisseOnline() {

    try {

        await db.collection("turnier")
            .doc("ergebnisse")
            .set({
                ergebnisse: ergebnisse
            });

    } catch (error) {

        alert("❌ Fehler beim Speichern der Ergebnisse: " + error);

    }

}
async function speichereQuotenOnline() {


    try {

        await db.collection("turnier")
            .doc("quoten")
            .set({
                spiele: spiele
            });


    } catch (error) {

        alert("❌ Fehler: " + error);

    }

}
function ladeQuotenOnline() {

    db.collection("turnier")
        .doc("quoten")
        .onSnapshot((doc) => {

            if (!doc.exists) return;

            const daten = doc.data().spiele;

            for (let i = 0; i < spiele.length; i++) {

                spiele[i].q1 = daten[i].q1;
                spiele[i].qx = daten[i].qx;
                spiele[i].q2 = daten[i].q2;

            }

            spieleAnzeigen();
            ladeQuoten();

        }, (error) => {

            alert("❌ Fehler beim Laden der Quoten: " + error.message);

        });

}

async function speichereSonderwettenOnline() {
    
    try {

        await db.collection("turnier")
            .doc("sonderwetten")
            .set({

                sonderwetten: sonderwetten

            });

    } catch (error) {

        alert("❌ Fehler beim Speichern: " + error.message);

    }

}
function ladeSonderwettenOnline() {



    db.collection("turnier")
        .doc("sonderwetten")
        .onSnapshot((doc) => {

        

            if (!doc.exists) {
            
                return;
            }

            sonderwetten = doc.data().sonderwetten || [];

        

            aktualisiereSonderwetten();

        }, (error) => {

            alert("❌ Fehler: " + error.message);

        });

}
async function ladeErgebnisseOnline() {

    db.collection("turnier")
        .doc("ergebnisse")
        .onSnapshot((doc) => {

            if (!doc.exists) return;

            ergebnisse = doc.data().ergebnisse;

            ladeErgebnisse();

            pruefeOffeneWetten();

        });

}


async function speichereSpielerOnline() {

    if (aktuellerSpieler === "") {
        alert("❌ aktuellerSpieler ist leer");
        return;
    }

    try {

        await db.collection("spieler")
            .doc(aktuellerSpieler)
            .set({

                name: aktuellerSpieler,

                coins: coins,
                offeneWetten: offeneWetten,
                ergebnisse: ergebnisse,
                ausgezahlteWetten: ausgezahlteWetten

            });

    } catch (error) {

        alert(
            "❌ Fehler:\n" +
            error.code + "\n" +
            error.message
        );

    }

}
async function ladeAlleSpieler() {

    try {

        const snapshot = await db.collection("spieler").get();

        let anzahl = 0;

        snapshot.forEach((doc) => {

            anzahl++;

        });

        alert("👥 Gefundene Spieler: " + anzahl);

    } catch (error) {

        alert("❌ Fehler beim Laden der Spieler:\n" + error.message);

    }

}
function ladeSpielerOnline(name) {

    db.collection("spieler")
        .doc(name)
        .onSnapshot((doc) => {

            if (!doc.exists) return;

            const spieler = doc.data();

            coins = spieler.coins || 1000;
            offeneWetten = spieler.offeneWetten || [];
            // Sonderwetten werden jetzt global aus Firestore geladen
            ergebnisse = spieler.ergebnisse || {};
            ausgezahlteWetten = spieler.ausgezahlteWetten || [];

            coinsAnzeige.innerHTML = "💰 " + coins + " Coins";

            aktualisiereOffeneWetten();
            aktualisiereSonderwetten();

        }, (error) => {

            alert("❌ Fehler beim Laden des Spielers: " + error.message);

        });

}
async function alleCoinsZuruecksetzen() {

    const startCoins = Number(
        document.getElementById("startCoins").value
    );

    if (!startCoins || startCoins <= 0) {

        alert("Bitte gültige Startcoins eingeben.");
        return;

    }

    if (!confirm("Wirklich allen Spielern " + startCoins + " Coins geben?")) {
        return;
    }

    const snapshot = await db.collection("spieler").get();

    for (const doc of snapshot.docs) {

        await db.collection("spieler")
            .doc(doc.id)
            .update({

                coins: startCoins,
                offeneWetten: [],
                ausgezahlteWetten: [],
                ergebnisse: {}

            });

    }

    alert("✅ Alle Spieler wurden zurückgesetzt und haben jetzt " + startCoins + " Coins.");

}
window.onload = function () {

    zeigeStart();

    ladeTeamsOnline();

    ladeErgebnisseOnline();

    ladeQuotenOnline();

    ladeSonderwettenOnline();

    const liste = localStorage.getItem("spielerliste");

    if (liste) {
        spielerliste = JSON.parse(liste);
    }

    const letzterSpieler = localStorage.getItem("letzterSpieler");

    if (letzterSpieler) {

        document.getElementById("name").value = letzterSpieler;

    }

};

