const puppeteer = require("puppeteer");
const cheerio =  require("cheerio");

const sample = {
    guests: 1,
    beedroms: 1,
    beds: 1,
    baths: 1,
    price: 350
};

let browser;
async function scrapeHomesInIndexPage(url) {
    try {
        const page = await browser.newPage();
        await page.goto(url);
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = await cheerio.load(html);
        const homes = $("[itemprop = 'url']").map((i, element) => 
            "https://" + $(element).attr("content").replace('undefined', 'airbnb.com.br')).get();
        return homes;
    } catch (err) {
        console.error(err);
    }
}

async function scrapeDescriptionPage(url, page){
    try{
        await page.goto(url, { waitUntil: "networkidle2"});
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = await cheerio.load(html);
        const pricePerNight = $("#site-content > div > div > div > div > div > div > div:nth-child(1) > div > div > div > div > div > div > div > div > div > div > span > span").text();
        const roomText = $("#site-content").text();
        const guestsAllowed = returnMatches(roomText, /\d+ hóspedes/);
        const bedrooms = returnMatches(roomText, /\d+ quarto/);
        const beds = returnMatches(roomText, /\d+ cama/);
        const bathroom = returnMatches(roomText, /\d+ banheiro/);
        const description = $("#site-content > div > div > div > div > div > div:nth-child(3) > div > div:nth-child(2) > div > span > div > div").text();
        //console.log(pricePerNight, guestsAllowed, bedrooms, beds, bathroom);
        /*
        $("#site-content > div > div > div:nth-child(1) > div:nth-child(2) > div > div > div > div > div > div > div > div > div").each((index, element) => {
            if (index == 0) return true;
            const figure = $(element).find("")
        });
        */
        return { description, url, pricePerNight, guestsAllowed, bedrooms, beds, bathroom };
    } catch(err) {
        console.error(err);
        console.error(url);
    }
}


function returnMatches(roomText, regex) {
    const regExMatches = roomText.match(regex);
    let result = "N/A";
    if (regExMatches != null) {
        result = regExMatches[0];
    } else {
        throw 'No regex matches found for: ${regex}';
    }
    return result;
}

async function scrape() {
    browser = await puppeteer.launch({ headless: false});
    // const page = await browser.newPage();
    const descriptionPage = await browser.newPage();
    const homes = await scrapeHomesInIndexPage("https://www.airbnb.com.br/s/Florian%C3%B3polis-~-SC/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&source=structured_search_input_header&search_type=pagination&place_id=ChIJ1zLGsk45J5URRscEagtVvIE&federated_search_session_id=46a818cb-bdec-4ff0-b219-62bceef09245");
    console.log(homes);
    for(var i = 0; i < homes.length; i++) {
        const result = await scrapeDescriptionPage(homes[i], descriptionPage);
        console.log(result);
    }
    // page.click('nav > ul > li');
    // await page.waitForNavigation();
}


scrape();