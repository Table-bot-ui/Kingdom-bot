export default {
  data: new SlashCommandBuilder()
    .setName("fixgrammar")
    .setDescription("Fix grammar"),

  async execute(interaction) {
    await interaction.deferReply(); // 👈 REQUIRED

    const text = interaction.options.getString("text");

    const fixed = /* your logic */;

    await interaction.editReply(fixed);
  }
};