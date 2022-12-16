import { Cluster } from "puppeteer-cluster";

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 3,
    puppeteerOptions: {
      headless: false,
      setViewport: {
        width: 1080,
        height: 1280,
      },
    },
  });

  const generateId = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz".split("");
    let id = "";
    for (let i = 0; i < 8; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  };

  const randomUrl = `https://smartcinema.ua/payment-succeed/` + generateId();

  await cluster.task(async ({ page, data: url }) => {
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
    // console.log(dateConverter(textDate));
    dateCompare(convertedDate);
    // console.log(dateCompare(convertedDate));
    element === null || dateCompare(convertedDate) === false
      ? await browser.close
      : await page.screenshot({
          path: "./runs/ticketID_" + generateId() + ".png",
        });
    await new Promise((r) => setTimeout(r, 3000));
  });

  // cluster.queue("http://www.google.com/");
  // cluster.queue("http://www.wikipedia.org/");
  cluster.queue(randomUrl);
  cluster.queue(randomUrl);
  cluster.queue(randomUrl);
  cluster.queue(randomUrl);
  // many more pages

  await cluster.idle();
  await cluster.close();
})();
