import { Cluster } from "puppeteer-cluster";

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 10,
    puppeteerOptions: {
      headless: false,
    },
  });
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
    const today = new Date().toLocaleString({
      timeZone: "Europe/Kyiv",
    });
    return convertedDate >= today;
    //Returns false if date is in the past, true if in future
  };

  const generateId = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
    let id = "";
    for (let i = 0; i < 8; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  };

  const staticUrl = `https://smartcinema.ua/payment-succeed/88c3de87`; // for testing purposes
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
    // console.log(day, date, time);
    const convertedDate = dateConverter(textDate);
    dateCompare(convertedDate);
    // || dateCompare(convertedDate) === false
    element === null || dateCompare(convertedDate) === false
      ? await browser.close
      : await page.screenshot({
          path: "./runs/ticketID_" + generateId() + ".png",
        });
    await new Promise((r) => setTimeout(r, 3000));
  });

  const callNTimes = (n, fn) => {
    for (let i = 0; i < n; i++) {
      fn();
    }
  };

  //Calls cluster.queue n times
  const clusterQueue = (n) => {
    callNTimes(n, () => cluster.queue(randomUrl));
  };

  //execute
  clusterQueue(3);

  await new Promise((r) => setTimeout(r, 3000));
  await cluster.idle();
  await cluster.close();
})();
