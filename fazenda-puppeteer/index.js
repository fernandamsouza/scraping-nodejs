const puppeteer = require('puppeteer');
var readline = require('readline');

let contagem = 0
let numeroVotos = 0;

function ask() {
    var leitor = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    leitor.question("Quantos votos?\n", function(answer) {
        numeroVotos = answer;
        console.log("\nIniciando votação");
        leitor.close();
        x();
    });
}

async function x() {
    const browser = await puppeteer.launch({ headless: false }); // headless: true -> browser invisível 
    const page = await browser.newPage();
    for (let i = 0; i < numeroVotos; i++) {
        await page.goto('https://afazenda.r7.com/a-fazenda-12/votacao');
        // Participantes: (voto para ficar)
        // figure:nth-child(3): Jojo
        // figure:nth-child(2): Cartolouco
        // figure:nth-child(1): Biel 
        await page.click('#box_5f5fb3b7416eb9a8d0000891 > div > div > div > div > section > div.voting-view > figure:nth-child(3) > button');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await delay(3000); // olha o ddos na record....
        contagem++
        console.log('Votos: ' + contagem);
    }
    await browser.close();
}

ask();

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}