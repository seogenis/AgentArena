const puppeteer = require("puppeteer");

/**
 * Takes a screenshot of the game running on localhost:3000
 * Useful for debugging and documenting game state
 * 
 * Usage: node tools/screenshot.js
 */
(async () => {
    // Start browser instance in headless mode and launch a new page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set viewport size to match game canvas
    await page.setViewport({ width: 1024, height: 768 });

    // Visit the game page
    await page.goto("http://localhost:3000/");

    // Wait for elements to load and render (10 seconds)
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Take a screenshot of the full page
    await page.screenshot({ path: "debug-screenshot.png", fullPage: true });
    
    console.log("Screenshot saved as debug-screenshot.png");

    // Close the browser
    await browser.close();
})();