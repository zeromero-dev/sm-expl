import puppeteer from "puppeteer";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";

// puppeteer.use(StealthPlugin());
//# regex used [0-9a-z]{8}

const dateConvert = (textDate) => {
  const convertedDate = new Date(textDate);
  const today = new Date();
  return convertedDate >= today;
};

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
  await page.goto(url);
  // await autoScroll(page);
  let element = await page.$(".tickets-list");
  //select and extract the date from span
  let dataArray = await page.$eval(
    // ".main .flex.column:last-child span.text-secondary",
    "div:not([class])",
    (el) => [el.innerText]);
    const index = dataArray.indexOf("Вінниця");
    // .map((el) => el.split(" "))
  // let textDate = dataArray.find((el) => el[0] === "Дата");
  console.log(dataArray, index);
  dateConvert();
  element === null
    ? await browser.close
    : await page.screenshot({
        path: "./runs/ticketID_" + generateId() + ".png",
      });
  await new Promise((r) => setTimeout(r, 3000));
  await browser.close();
})();

//# to get your ticket attached: smartcinema.ua/reservation/${generateId()}/google-passes
