import { SlashCommandBuilder } from "discord.js";

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
      const response = await fetch(
        `https://api.languagetoolplus.com/v2/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            text: text,
            language: "en-US"
          })
        }
      );

      const data = await response.json();

      if (!data.matches || data.matches.length === 0) {
        await interaction.editReply("✅ Your sentence is already correct!");
        return;
      }

      // Apply first suggestion from API
      let corrected = text;
      for (const match of data.matches) {
        if (match.replacements && match.replacements.length > 0) {
          corrected =
            corrected.slice(0, match.offset) +
            match.replacements[0].value +
            corrected.slice(match.offset + match.length);
        }
      }

      await interaction.editReply(`✏️ Corrected sentence: ${corrected}`);

    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Could not check grammar. Try again later.");
    }
  }
};