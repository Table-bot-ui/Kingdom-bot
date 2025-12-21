import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { REST, Routes } from "discord.js";

dotenv.config();

// Your bot's application ID (correct)
const BOT_ID = "1386337364884062280";
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("❌ TOKEN missing in .env");
  process.exit(1);
}

const commands = [];

const commandsDir = path.join(process.cwd(), "commands");
const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const module = await import(`./commands/${file}`);
  const command = module.default || module;

  if (!command.data) {
    console.log(`⚠️ Skipped (no data): ${file}`);
    continue;
  }

  commands.push(command.data.toJSON());
  console.log(`📗 Loaded slash command for deployment: ${command.data.name}`);
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

try {
  console.log("🚀 Deploying slash commands...");

  await rest.put(
    Routes.applicationCommands(BOT_ID),
    { body: commands }
  );

  console.log("✅ Slash commands deployed!");
} catch (err) {
  console.error("❌ Error deploying commands:");
  console.error(err);
}