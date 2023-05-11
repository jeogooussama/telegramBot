const express = require("express");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

// Define the Telegram bot token
const telegram_bot_token = "6043532874:AAFDmSDHKUp1RELCyQK1r6kEuq-AKDGNrTQ";

// Define the API endpoint and parameters
const url = "https://www.stands4.com/services/v2/quotes.php";
const params = {
  uid: "11656",
  tokenid: "Mx4CUF0ZHeZcvbPy",
  searchtype: "RANDOM",
  format: "json",
};
// Set up Telegram bot
const bot = new TelegramBot(telegram_bot_token, { polling: true });

// Set up Express server
const app = express();
const port = 3000;
// Set up endpoint for Telegram webhook
app.post("/", (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    res.status(err.status, err);
  }
});

// Set up interval for sending quotes
const interval = 1200000; // 20 minutes
let timerId = null;
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    "Hold on, I will send you a quote every 20 minutes!"
  );
  // Send the first quote immediately
  await sendQuote(chatId);
  // Set up interval for sending subsequent quotes
  timerId = setInterval(() => {
    sendQuote(chatId);
  }, interval);
});
bot.onText(/\/stop/, async (msg) => {
  clearInterval(timerId);
  await bot.sendMessage(msg.chat.id, "Okay, I won't send you any more quotes.");
});

// Define function to send a quote to the user
async function sendQuote(chatId) {
  try {
    const response = await axios.get(url, { params });
    const quote = response.data.result.quote;
    const author = response.data.result.author;
    const telegram_message = `Here's a quote for you:\n\n${quote}\n- ${author}`;
    await bot.sendMessage(chatId, telegram_message);
  } catch (error) {
    bot.on("polling_error", (msg) => console.log(msg));
  }
}

// Start listening on port 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
