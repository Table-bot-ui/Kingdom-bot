import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import fetch from "node-fetch";

export default {
  name: "quote",
  async execute(message) {
    async function getQuote() {
      const response = await fetch("https://zenquotes.io/api/random");
      const data = await response.json();
      return `${data[0].q} — ${data[0].a}`;
    }

    const quoteText = await getQuote();
    const embed = new EmbedBuilder()
      .setTitle("💬 Random Quote")
      .setDescription(quoteText)
      .setColor("#5100ff");

    const button = new ButtonBuilder()
      .setCustomId("new_quote")
      .setLabel("🔁 New Quote")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);
    const sent = await message.reply({ embeds: [embed], components: [row] });

    const collector = sent.createMessageComponentCollector({
      filter: i => i.customId === "new_quote" && i.user.id === message.author.id,
      time: 60000
    });

    collector.on("collect", async i => {
      const newQuote = await getQuote();
      const newEmbed = EmbedBuilder.from(embed).setDescription(newQuote);
      await i.update({ embeds: [newEmbed] });
    });
  }
};

export function setupQuoteInteraction() {}