import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Your OpenAI key from Railway env

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
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a grammar assistant. If the sentence is correct, respond 'Correct'. If it has errors, provide the corrected sentence only."
          },
          {
            role: "user",
            content: `Check this sentence: "${text}"`
          }
        ]
      });

      const result = response.choices[0].message.content.trim();

      if (result.toLowerCase().includes("correct")) {
        await interaction.editReply("✅ Your sentence is already correct!");
      } else {
        await interaction.editReply(`✏️ Corrected sentence: ${result}`);
      }

    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Could not check grammar. Try again later.");
    }
  }
};