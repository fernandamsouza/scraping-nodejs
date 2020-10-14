const request = require("request-promise");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Listing = require("./model/Listing");
const objectsToCsv = require("objects-to-csv");
const ObjectsToCsv = require("objects-to-csv");

const scrapingResults = [
    {title: "Technical Specialist, Interaction Sound Design | $42 - $46 per hour",
    datePosted: new Date("2020-10-13 12:00:00"),
    neighborhood: "(park)",
    url: "https://sfbay.craigslist.org/pen/sof/d/menlo-park-technical-specialist/7213301853.html",
    jobDescription: "HireArt is helping the world's largest social network find a Technical Specialist, Interaction Sound Design to support the team responsible for creating and maintaining the sonic voices for its products...",
    compensation: "$41 - $46 per hour"
    }
];

async function connectToMongoDb() {
    await mongoose.connect("mongodb+srv://dbcraiglist:963123@cluster0.eout2.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true}
    );
    console.log("connected to mongodb");
}

async function scrapeListings(page) {
    await page.goto("https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof");
    const html = await page.content();
    const $ = cheerio.load(html);
    // $(".result-title").each((index, element) => console.log($(element).text()));
    // $(".result-title").each((index, element) => 
    //     console.log($(element).attr("href"))
    // );
    const listings = $(".result-info").map((index, element) => {
        const titleElement = $(element).find(".result-title");
        const timeElement = $(element).find(".result-date");
        const hoodElement = $(element).find(".result-hood");
        const title = $(titleElement).text();
        const url = $(titleElement).attr("href");
        const datePosted = new Date ($(timeElement).attr("datetime"));
        const hood = $(hoodElement).text().trim().replace("(","").replace(")","");
        return {title, url, datePosted, hood};
    }).get();
    return listings;
}

async function scrapeJobDescriptions (listings, page) {
    for (var i = 0; i < listings.length; i++) {
        await page.goto(listings[i].url);
        const html = await page.content();
        const $ = cheerio.load(html);
        const jobDescription = $("#postingbody").text();
        const compensation = $("p.attrgroup > span:nth-child(1) > b").text();
        listings[i].jobDescription = jobDescription;
        listings[i].compensation = compensation;
        console.log(listings[i].jobDescription);
        console.log(listings[i].compensation);
        const listingModel = new Listing(listings[i]);
        await listingModel.save();
        await sleep(1000); // 1 second sleep
    }
}

async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

async function createCsvFile(data) {
    let csv = new ObjectsToCsv(data);
    // Save to file
    await csv.toDisk("./test.csv");
}

async function main() {
    await connectToMongoDb();
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const listings = await scrapeListings(page);
    await createCsvFile(listings);
    const listingsWithJobDescriptions = await scrapeJobDescriptions(
        listings
        ,page);
    console.log(listings);
}

main();