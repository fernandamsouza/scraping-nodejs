const request = require("request-promise");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const scrapingResults = [
    {title: "Technical Specialist, Interaction Sound Design | $42 - $46 per hour",
    datePosted: new Date("2020-10-13 12:00:00"),
    neighborhood: "(park)",
    url: "https://sfbay.craigslist.org/pen/sof/d/menlo-park-technical-specialist/7213301853.html",
    jobDescription: "HireArt is helping the world's largest social network find a Technical Specialist, Interaction Sound Design to support the team responsible for creating and maintaining the sonic voices for its products...",
    compensation: "$41 - $46 per hour"
    }
];

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof");
    const html = await page.content();
    const $ = cheerio.load(html);
    // $(".result-title").each((index, element) => console.log($(element).text()));
    // $(".result-title").each((index, element) => 
    //     console.log($(element).attr("href"))
    // );
    const results = $(".result-title").map((index, element) => {
        const title = $(element).text();
        const url = $(element).attr("href");
        return {title, url};
    }).get();
    console.log(results);
}


main();