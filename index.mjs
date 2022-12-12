import puppeteer from "puppeteer";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";

// puppeteer.use(StealthPlugin());
//# regex used [0-9a-z]{8}

const generateId = () => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

const randomUrl = `https://smartcinema.ua/payment-succeed/` + generateId();
//static for trsting
const url = `https://smartcinema.ua/payment-succeed/02e8914e`;
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1080,
    height: 1280,
    deviceScaleFactor: 1,
  });
  await page.goto(randomUrl);
  // await autoScroll(page);
  let element = await page.$(".tickets-list");
  element === null
    ? await browser.close
    : await page.screenshot({
        path: "./runs/ticketID_" + generateId() + ".png",
      });
  await new Promise((r) => setTimeout(r, 3000));
  await browser.close();
})();
