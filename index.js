import { Client, GatewayIntentBits, Collection } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Load all command files
const commandFiles = fs
  .readdirSync(__dirname)
  .filter(file => file.endsWith(".js") && file !== "index.js");

for (const file of commandFiles) {
  import(`./${file}`).then(module => {
    const command = module.default;
    client.commands.set(command.name, command);
    console.log(`✅ Loaded command: ${command.name}`);
  });
}

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async message => {
  if (message.author.bot || !message.content.startsWith("!")) return;
  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    await message.reply("Error while executing that command.");
  }
});

client.login(process.env.TOKEN);
import express from "express";
const server = express();
server.all("/", (req, res) => {
  res.send("Bot is running!");
});
server.listen(3000, () => console.log("Server is Ready."));