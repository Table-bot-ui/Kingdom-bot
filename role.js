import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from "discord.js";

export default {
  name: "roles",
  async execute(message) {
    const roles = {
      red: "1434181896149143664",
      blue: "1434181969175908533",
      green: "1434182045327691808",
      yellow: "1434182103028994150",
      black: "1434182200001036459",
      white: "1434182270914138152"
    };

    const embed = new EmbedBuilder()
      .setTitle("🎨 Choose Your Color Roles")
      .setDescription(
        "Select or deselect color roles from the menu below.\n\n" +
        "✅ Selecting adds a role.\n❌ Deselecting removes it."
      )
      .setColor("#5100ff");

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("color_roles")
      .setPlaceholder("Select your color roles")
      .setMinValues(0)
      .setMaxValues(Object.keys(roles).length) // allow multiple
      .addOptions([
        new StringSelectMenuOptionBuilder().setLabel("Red").setValue("red").setEmoji("🔴"),
        new StringSelectMenuOptionBuilder().setLabel("Blue").setValue("blue").setEmoji("🔵"),
        new StringSelectMenuOptionBuilder().setLabel("Green").setValue("green").setEmoji("🟢"),
        new StringSelectMenuOptionBuilder().setLabel("Yellow").setValue("yellow").setEmoji("🟡"),
        new StringSelectMenuOptionBuilder().setLabel("Black").setValue("black").setEmoji("⚫"),
        new StringSelectMenuOptionBuilder().setLabel("White").setValue("white").setEmoji("⚪")
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    // Create a collector that stays active
    const collector = sentMessage.createMessageComponentCollector({
      componentType: 3,
      time: 0
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;
      if (interaction.customId !== "color_roles") return;

      const selected = interaction.values; // Array of selected role keys
      const member = await interaction.guild.members.fetch(interaction.user.id);

      const allRoleIds = Object.values(roles);
      const selectedRoleIds = selected.map((r) => roles[r]);

      // Remove all color roles first
      await member.roles.remove(allRoleIds).catch(() => {});
      // Then add only the selected ones
      await member.roles.add(selectedRoleIds).catch(() => {});

      await interaction.reply({
        content: `🎨 Your color roles have been updated: ${
          selected.length
            ? selected.map((r) => `**${r.charAt(0).toUpperCase() + r.slice(1)}**`).join(", ")
            : "none"
        }.`,
        ephemeral: true
      });
    });
  }
};