import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("fixgrammar")
    .setDescription("Fix grammar of the provided text")
    .addStringOption(option =>
      option
        .setName("text")
        .setDescription("Text to fix")
        .setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString("text");

    // Simple grammar fix: fix common mistakes like 'is you' -> 'are you'
    let fixed = text
      .replace(/\bis you\b/gi, "are you")
      .replace(/\bi am\b/gi, "I am") // capitalize "I"
      .replace(/\bi\b/gi, "I") // capitalize standalone i
      .replace(/\s+/g, " ") // remove extra spaces
      .trim();

    // Send as a normal message in the channel
    await interaction.reply(`Here’s your “fixed” text: ${fixed}`);
  }
};