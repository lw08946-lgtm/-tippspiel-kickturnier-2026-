// ===============================
// Tippspiel Kickturnier 2026
// Version 1.0
// ===============================
alert("script.js wurde geladen");

let coins = 1000;
let wettschein = [];

const spielerAnzeige = document.getElementById("spieler");
const coinsAnzeige = document.getElementById("coins");
const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", login);

function login() {

    const name = document.getElementById("name").value.trim();

    if(name === ""){
        alert("Bitte gib deinen Namen ein.");
        return;
    }

    spielerAnzeige.innerHTML = "👤 " + name;
    coinsAnzeige.innerHTML = "💰 " + coins + " Coins";

    localStorage.setItem("spieler", name);

    alert("Willkommen " + name + "!");
}

window.onload = function(){

    const name = localStorage.getItem("spieler");

    if(name){
        spielerAnzeige.innerHTML = "👤 " + name;
        coinsAnzeige.innerHTML = "💰 " + coins + " Coins";
    }

}

function wetteAuswaehlen(spielId, text, quote){

    // Vorhandenen Tipp für dieses Spiel entfernen
    wettschein = wettschein.filter(tipp => tipp.spielId !== spielId);

    // Neuen Tipp hinzufügen
    wettschein.push({
        spielId: spielId,
        text: text,
        quote: quote
    });

    const liste = document.getElementById("wettscheinListe");

    liste.innerHTML = "";

    for(let tipp of wettschein){

        liste.innerHTML +=
        "<p>✔️ " + tipp.text + " (" + tipp.quote.toFixed(2) + ")</p>";

    }

    berechneGewinn();

}

    const liste = document.getElementById("wettscheinListe");

    liste.innerHTML = "";

    for(let tipp of wettschein){

        liste.innerHTML +=
        "<p>✔️ " + tipp.text + " (" + tipp.quote.toFixed(2) + ")</p>";

    }

    berechneGewinn();

}

function berechneGewinn(){

    let gesamtquote = 1;

    for(let tipp of wettschein){
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
