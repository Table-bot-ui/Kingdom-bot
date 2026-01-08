import "./keepalive.js";
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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
client.slashCommands = new Collection();

(async () => {
  // -------- PREFIX COMMANDS --------
  const prefixFolder = path.join(__dirname, "prefix");

  if (fs.existsSync(prefixFolder)) {
    const prefixFiles = fs.readdirSync(prefixFolder).filter(f => f.endsWith(".js"));

    for (const file of prefixFiles) {
      const module = await import(`./prefix/${file}`);
      const cmd = module.default;

      if (!cmd?.name || !cmd?.execute) continue;
      client.commands.set(cmd.name, cmd);
      console.log(`📘 Loaded prefix command: ${cmd.name}`);
    }
  }

  // -------- SLASH COMMANDS --------
  const slashFolder = path.join(__dirname, "commands");

  if (fs.existsSync(slashFolder)) {
    const slashFiles = fs.readdirSync(slashFolder).filter(f => f.endsWith(".js"));

    for (const file of slashFiles) {
      const module = await import(`./commands/${file}`);
      const cmd = module.default;

      if (!cmd?.data || !cmd?.execute) continue;
      client.slashCommands.set(cmd.data.name, cmd);
      console.log(`📗 Loaded slash command: ${cmd.data.name}`);
    }
  }
})();

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// PREFIX handler
client.on("messageCreate", async message => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const name = args.shift().toLowerCase();
  const cmd = client.commands.get(name);
  if (!cmd) return;

  try {
    await cmd.execute(message, args, client);
  } catch (err) {
    console.error(err);
    message.reply("Command error.");
  }
});

// SLASH handler
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.slashCommands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction, client);
  } catch (err) {
    console.error(err);
    if (!interaction.replied)
      interaction.reply({ content: "Slash command error.", ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);