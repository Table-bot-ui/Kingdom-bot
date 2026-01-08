import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("fixgrammar")
    .setDescription("Fix grammar")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Text to fix")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply(); // required for longer responses

    const text = interaction.options.getString("text");

    // Temporary placeholder logic — just echoes the text
    // Replace this with actual grammar fixing logic/API
    const fixed = `Here’s your “fixed” text: ${text}`;

    await interaction.editReply(fixed);
  }
};