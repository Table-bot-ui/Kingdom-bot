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
const { queue } = require("./musicPlayer");
const { EmbedBuilder } = require("discord.js");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const serverQueue = queue.get(interaction.guild.id);
  if (!serverQueue) {
    return interaction.reply({ content: "❌ No music playing!", ephemeral: true });
  }

  switch (interaction.customId) {
    case "pause":
      serverQueue.player.pause();
      return interaction.reply({ content: "⏸ Paused", ephemeral: true });

    case "resume":
      serverQueue.player.unpause();
      return interaction.reply({ content: "▶ Resumed", ephemeral: true });

    case "skip":
      serverQueue.player.stop();
      return interaction.reply({ content: "⏭ Skipped", ephemeral: true });

    case "stop":
      serverQueue.songs = [];
      serverQueue.player.stop();
      serverQueue.connection.destroy();
      queue.delete(interaction.guild.id);
      return interaction.reply({ content: "⏹ Stopped", ephemeral: true });

    case "loop":
      serverQueue.loop = !serverQueue.loop;
      return interaction.reply({
        content: `🔁 Loop ${serverQueue.loop ? "Enabled" : "Disabled"}`,
        ephemeral: true,
      });

    case "queue":
      const list = serverQueue.songs
        .map((s, i) => `${i + 1}. ${s.title}`)
        .slice(0, 10)
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("📜 Song Queue")
        .setDescription(list || "Empty")
        .setColor(0x1db954);

      return interaction.reply({ embeds: [embed], ephemeral: true });

    case "volup":
      serverQueue.volume = Math.min(serverQueue.volume + 0.1, 2);
      serverQueue.resource.volume.setVolume(serverQueue.volume);
      return interaction.reply({ content: "🔊 Volume Up", ephemeral: true });

    case "voldown":
      serverQueue.volume = Math.max(serverQueue.volume - 0.1, 0);
      serverQueue.resource.volume.setVolume(serverQueue.volume);
      return interaction.reply({ content: "🔉 Volume Down", ephemeral: true });
  }
});
client.login(process.env.DISCORD_TOKEN);