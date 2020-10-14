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
        console.log(pricePerNight);
    } catch(err) {
        console.error(err);
    }
}
async function main() {
    browser = await puppeteer.launch({ headless: false});
    const descriptionPage = await browser.newPage();
    const homes = await scrapeHomesInIndexPage("https://www.airbnb.com.br/s/Florian%C3%B3polis-~-SC/homes?tab_id=home_tab&refinement_paths%5B%5D=%2Fhomes&source=structured_search_input_header&search_type=pagination&place_id=ChIJ1zLGsk45J5URRscEagtVvIE&federated_search_session_id=b1fe5bbd-7dd7-4656-bbbd-7eeaf81111c0&items_offset=20&section_offset=3");
    for(var i = 0; i < homes.length; i++) {
        await scrapeDescriptionPage(homes[i], descriptionPage);
    }
}

main();