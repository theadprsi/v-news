import { Client, Message, MessageEmbed } from "discord.js";
import axios from "axios";
import * as cheerio from "cheerio";

require("dotenv").config();

// Instance
const client = new Client();

// News Array
let news: Array<string> = [];

// Web Scraping
// Needs the news page web link and then html class that contains the news links
// Define array ->  _TECH, _SPACE, _GAMING, _HARDWARE
// Array Structure ->  _TECH = ["news page link", "html classes", "any url as a prefix that's needed for correction"]
// Example -> const _TECH = ["https://www.wired.com/latest-news", ".news-container .news-link"];
// Replace

// links
// You might not need this
const _TECH = process.env.TECH?.split(" | ");
const _SPACE = process.env.SPACE?.split(" | ");
const _GAMING = process.env.GAMING?.split(" | ");
const _HARDWARE = process.env.HARDWARE?.split(" | ");
// You might not need this
// links

// Bot ready
client.on("ready", () => {
  console.log("----- Bot Is Ready -----");
});

//
// Check message if for bot
const messageForV = (value: string): number => {
  if (value.startsWith("!news")) return 1;
  else if (value.startsWith("!v")) return 2;
  else return 0;
};

//
// Download html
const downloadHTML = async (category: string, count: number) => {
  news = await [];

  try {
    const categoryData: Array<string> = await eval(
      `_${category.toUpperCase()}`
    );

    const response = await axios.get(categoryData[0]);
    const data = await response.data;

    await getNews(data, categoryData[1], count, categoryData[2]);
  } catch (e) {}
};

//
// Get news
const getNews = async (
  data: any,
  pattern: string,
  count: number,
  url: string
) => {
  const $ = await cheerio.load(data);
  const items = await $(pattern);

  await items.slice(0, count).each((i, item) => {
    const link = $(item).attr("href");

    if (link?.startsWith("https://")) news = [...news, link];
    else news = [...news, url + link];
  });
};

//
// Sent news
const sentNews = async (content: string, msg: Message) => {
  const param = content.length > 5 ? content.slice(6) : undefined;

  let category = param?.split(" ")[0];
  let count = param?.split(" ")[1];

  category = category === undefined ? "tech" : category;
  count = count === undefined ? "5" : count;

  msg.reply({
    embed: new MessageEmbed()
      .setTitle("Hi")
      .setDescription("Please wait, while I'm getting some news for you."),
  });

  //
  await downloadHTML(category, parseInt(count));

  if (news.length > 0) {
    news.forEach((data) => msg.channel.send(`${data}`));
  } else
    msg.channel.send({
      embed: new MessageEmbed()
        .setTitle("Invalid Command")
        .setDescription(
          "*Type* **!news** *for news.*\n" +
            "*Type* **!v help** *for more help.*\n" +
            "*Type* **!v about** *for info.*"
        ),
    });
};

//
// Get about
const getAbout = (msg: Message) => {
  msg.reply({
    embed: new MessageEmbed()
      .setTitle("About")
      .setDescription(
        "I'm a bot that gets you latest and personalized technology news."
      )
      .addField(
        "Add me to a another Discord server",
        "https://discord.com/api/oauth2/authorize?client_id=795160834937716746&permissions=0&scope=bot"
      )
      .addField("Developed by", "[ADPRSI](https://adprsi.netlify.app/)", true),
  });
};

//
// Get help
const getHelp = (msg: Message) => {
  msg.reply({
    embed: new MessageEmbed()
      .setTitle("Help")
      .setDescription(
        "Example : !news tech 5\n\n*!news<SPACE>Category<SPACE>Count*"
      )
      .addField("Category", "tech, gaming, hardware, space and more.")
      .addField("Count", "1 - 10 or more."),
  });
};

// On message
client.on("message", async (msg: Message) => {
  const content = msg.content.toLowerCase();

  if (messageForV(content) === 1) sentNews(content, msg);
  else if (messageForV(content) === 2) {
    if (content === "!v about") getAbout(msg);
    else if (content === "!v help") getHelp(msg);
  }
});

// Login
client.login(process.env.BOT_TOKEN);
