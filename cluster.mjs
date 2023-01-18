import { Cluster } from "puppeteer-cluster";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

(async () => {
  const callNTimes = (n, fn) => {
    for (let i = 0; i < n; i++) {
      fn();
    }
  };
  //Calls cluster.queue n times
  const clusterQueue = (n) => {
    callNTimes(n, () => cluster.queue(staticUrl));
  };

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 10,
    puppeteerOptions: {
      headless: false,
    },
  });
  // the date on the site needs to be converted to a date object
  // other way it doesn't work with dateCompare function
  const dateConverter = (text) => {
    const splitted = text.split(" ");
    let date = splitted[1];
    const time = splitted[2] + ":00";
    date = date.replace(/\./g, "/");
    date =
      date.substr(3, 2) + "/" + date.substr(0, 2) + "/" + date.substr(6, 4);
    return new Date(new Date(date + " " + time)).toLocaleString({
      timeZone: "Europe/Kyiv",
    });
  };

  const dateCompare = (convertedDate) => {
    const today = new Date()
    return convertedDate >= today;
    //Returns false if date is in the past, true if in future
  };

  // Generates uuid (8 characters)
  const generateId = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
    let id = "";
    for (let i = 0; i < 8; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  };

  const staticUrl = `https://smartcinema.ua/payment-succeed/e58b04f8`; // for testing purposes
  const randomUrl = `https://smartcinema.ua/payment-succeed/` + generateId();


  await cluster.task(async ({ page, data: url }) => {
    await page.setViewport({
      width: 1080,
      height: 1280,
      deviceScaleFactor: 1,
    });
    await page.goto(url);
    let element = await page.$(".tickets-list");
    //Select and extract the date from span
    let dataArray = await page.$eval("div:not([class])", (el) =>
      el.innerText.replace(/(\r\n|\n|\r)/gm, " ").split(" ")
    );
    //Find the date on the page
    const index = dataArray.indexOf("Дата");
    let day = dataArray[index + 1];
    let date = dataArray[index + 2];
    let time = dataArray[index + 3];
    let textDate = day + " " + date + " " + time;
    console.log(day, date, time);
    const convertedDate = dateConverter(textDate);
    console.log(convertedDate)
    dateCompare(convertedDate);
    console.log(dateCompare(convertedDate));
    element === null || dateCompare(convertedDate) === false
      ? await browser.close
      : await page.screenshot({
          path: "./runs/ticketID_" + generateId() + ".png",
        });
    await new Promise((r) => setTimeout(r, 3000));
  });

  //executes the cluster.queue function
  clusterQueue(1);

  //tried to implement the input stream, but it doesn't work as intended
  // const rl = readline.createInterface({ input, output });
  // const amountOfRuns = await rl.question("How many runs? ");
  // clusterQueue(amountOfRuns); // opens amount of tabs the input stream
  // await rl.output.write("Opened " + amountOfRuns + " tabs.");
  // sucess === true
  //   ? rl.output.write("Ticket with ID" + generateId() + "found")
  //   : rl.output.write("No tickets found");
  // await rl.close();

  await new Promise((r) => setTimeout(r, 3000));
  await cluster.idle();
  await cluster.close();
})();
