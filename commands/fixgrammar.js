import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("fixgrammar")
    .setDescription("Check and fix grammar of a sentence")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("Text to check")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const text = interaction.options.getString("text");

    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          text,
          language: "en-US"
        })
      });

      const data = await res.json();

      if (data.matches.length === 0) {
        await interaction.editReply("✅ Your sentence is already correct!");
      } else {
        // Apply all suggested replacements
        let corrected = text;
        for (const match of data.matches.reverse()) {
          if (match.replacements.length > 0) {
            const rep = match.replacements[0].value;
            corrected = corrected.slice(0, match.offset) + rep + corrected.slice(match.offset + match.length);
          }
        }
        await interaction.editReply(`✏️ Corrected sentence: ${corrected}`);
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Could not check grammar. Please try again later.");
    }
  }
};