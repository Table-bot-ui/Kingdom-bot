import { SlashCommandBuilder } from "discord.js";
import axios from "axios";

export default {
  data: new SlashCommandBuilder()
    .setName("fixgrammar")
    .setDescription("Fix grammar & improve sentences in any language.")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Text to correct")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const original = interaction.options.getString("text");

    try {
      const res = await axios.post(
        "https://api.pehrdahl.dev/api/grammarly",
        { text: original }
      );

      const fixed = res.data.corrected || "No corrections.";

      await interaction.editReply(
        `**Original:**\n${original}\n\n**Fixed:**\n${fixed}`
      );
    } catch (err) {
      console.error(err);
      await interaction.editReply("Grammar correction failed.");
    }
  }
};