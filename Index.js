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

// Collections
client.commands = new Collection();      // prefix commands
client.slashCommands = new Collection(); // slash commands

// ----------------------------
// Load PREFIX commands (root folder)
// ----------------------------
const prefixFiles = fs
  .readdirSync(__dirname)
  .filter(file =>
    file.endsWith(".js") &&
    !["index.js", "keepalive.js"].includes(file)
  );

for (const file of prefixFiles) {
  import(`./${file}`).then(module => {
    const cmd = module.default;
    if (!cmd || !cmd.name || !cmd.execute) return;

    client.commands.set(cmd.name, cmd);
    console.log(`📘 Loaded prefix command: ${cmd.name}`);
  });
}

// ----------------------------
// Load SLASH commands (./commands folder)
// ----------------------------
const slashFolder = path.join(__dirname, "commands");

if (fs.existsSync(slashFolder)) {
  const slashFiles = fs.readdirSync(slashFolder).filter(f => f.endsWith(".js"));

  for (const file of slashFiles) {
    import(`./commands/${file}`).then(module => {
      const cmd = module.default;
      if (!cmd || !cmd.data || !cmd.execute) return;

      client.slashCommands.set(cmd.data.name, cmd);
      console.log(`📗 Loaded slash command: ${cmd.data.name}`);
    });
  }
}

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ----------------------------
// PREFIX COMMAND HANDLER
// ----------------------------
client.on("messageCreate", async message => {
  if (!message.content.startsWith("!") || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const name = args.shift().toLowerCase();
  const cmd = client.commands.get(name);
  if (!cmd) return;

  try {
    // FIXED: pass client
    await cmd.execute(message, args, client);
  } catch (err) {
    console.error(err);
    message.reply("Command error.");
  }
});

// ----------------------------
// SLASH COMMAND HANDLER
// ----------------------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.slashCommands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction, client);
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "Slash command error.", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
