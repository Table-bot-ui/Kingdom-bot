import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";

// Make sure you set OPENAI_API_KEY in Railway or your .env
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
        model: "gpt-3.5-turbo", // cheaper than GPT-4
        messages: [
          {
            role: "system",
            content: "You are a grammar assistant. If the sentence is correct, reply exactly: 'Correct'. If it's wrong, provide only the corrected sentence with proper grammar, punctuation, and capitalization."
          },
          {
            role: "user",
            content: `Check and fix this sentence: "${text}"`
          }
        ],
        temperature: 0 // make it deterministic
      });

      const result = response.choices[0].message.content.trim();

      if (result.toLowerCase() === "correct") {
        await interaction.editReply("✅ Your sentence is already correct!");
      } else {
        await interaction.editReply(`✏️ Corrected sentence: ${result}`);
      }

    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Could not check grammar. Please try again later.");
    }
  }
};