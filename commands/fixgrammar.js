import { SlashCommandBuilder } from "discord.js";
import OpenAI from "openai";

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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional grammar checker. Always correct the sentence to proper English with correct grammar, punctuation, and capitalization. Only return the corrected sentence. If the sentence is already perfect, return 'Correct'. Do not echo the original text."
          },
          {
            role: "user",
            content: `Fix this sentence: "${text}"`
          }
        ],
        temperature: 0
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