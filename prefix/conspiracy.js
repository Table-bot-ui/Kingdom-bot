import fs from "fs";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

// File where conspiracies are stored
const FILE_PATH = "conspiracies.json";

// Memory tracking
let usedTheories = new Set();

// Function to get conspiracies
function loadConspiracies() {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Function to save conspiracies
function saveConspiracies(conspiracies) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(conspiracies, null, 2));
}

// Function to get a random non-repeating conspiracy
function getUniqueTheory() {
  const conspiracies = loadConspiracies();
  if (conspiracies.length === 0) return "No conspiracies available!";

  if (usedTheories.size === conspiracies.length) usedTheories.clear();

  let theory;
  do {
    theory = conspiracies[Math.floor(Math.random() * conspiracies.length)];
  } while (usedTheories.has(theory) && usedTheories.size < conspiracies.length);

  usedTheories.add(theory);
  return theory;
}

export default {
  name: "conspiracy",
  description: "Generates a random conspiracy theory with buttons.",
  async execute(message) {
    const theory = getUniqueTheory();

    const embed = new EmbedBuilder()
      .setTitle("🌀 Conspiracy Theory Generator")
      .setDescription(`> **${theory}**`)
      .setColor("#2f3136")
      .setFooter({ text: "Press a button below to generate or contribute!" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("generate_more")
        .setLabel("🔁 Generate More")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("contribute")
        .setLabel("💡 Contribute")
        .setStyle(ButtonStyle.Success)
    );

    const sent = await message.reply({ embeds: [embed], components: [row] });

    const collector = sent.createMessageComponentCollector({
      time: 180000, // 3 minutes
    });

    collector.on("collect", async interaction => {
      if (interaction.customId === "generate_more") {
        const newTheory = getUniqueTheory();
        const newEmbed = new EmbedBuilder()
          .setTitle("🌀 Conspiracy Theory Generator")
          .setDescription(`> **${newTheory}**`)
          .setColor("#2f3136")
          .setFooter({ text: "Press a button below to generate or contribute!" });

        await interaction.update({ embeds: [newEmbed], components: [row] });
      }

      if (interaction.customId === "contribute") {
        await interaction.reply({
          content: "💭 Type your new conspiracy theory below (within 20 seconds)...",
          ephemeral: true,
        });

        const filter = m => m.author.id === interaction.user.id;
        const msgCollector = interaction.channel.createMessageCollector({
          filter,
          time: 20000,
          max: 1,
        });

        msgCollector.on("collect", m => {
          const input = m.content.trim();

          // Ignore junk or single-word inputs
          if (input.length < 10 || !input.includes(" ")) {
            m.reply("❌ Too short or invalid! Try writing a full sentence.");
            return;
          }

          const conspiracies = loadConspiracies();
          conspiracies.push(input);
          saveConspiracies(conspiracies);

          m.reply("✅ Added your theory to the database!");
        });
      }
    });

    collector.on("end", async () => {
      await sent.edit({ components: [] }).catch(() => {});
    });
  },
};