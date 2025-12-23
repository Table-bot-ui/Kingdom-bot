// roles.js
import {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType
} from "discord.js";

export default {
  name: "roles",
  async execute(message) {
    if (!message.guild) {
      return message.reply("This command only works in servers.");
    }

    // map keys -> role IDs (use the IDs you provided)
    const roles = {
      red: "1434181896149143664",
      blue: "1434181969175908533",
      green: "1434182045327691808",
      yellow: "1434182103028994150",
      black: "1434182200001036459",
      white: "1434182270914138152"
    };

    const embed = new EmbedBuilder()
      .setTitle("🎨 Choose a Color Role")
      .setDescription(
        "Select a single color role from the menu below.\n\n" +
        "• Select one to add it.\n" +
        "• Deselect everything (submit with nothing) to remove your color role."
      )
      .setColor("#5100ff");

    const select = new StringSelectMenuBuilder()
      .setCustomId("color_roles")
      .setPlaceholder("Select or deselect your color role")
      .setMinValues(0)           // allow submitting with no selection (deselect)
      .setMaxValues(1)           // only one role allowed
      .addOptions([
        new StringSelectMenuOptionBuilder().setLabel("Red").setValue("red").setEmoji("🔴"),
        new StringSelectMenuOptionBuilder().setLabel("Blue").setValue("blue").setEmoji("🔵"),
        new StringSelectMenuOptionBuilder().setLabel("Green").setValue("green").setEmoji("🟢"),
        new StringSelectMenuOptionBuilder().setLabel("Yellow").setValue("yellow").setEmoji("🟡"),
        new StringSelectMenuOptionBuilder().setLabel("Black").setValue("black").setEmoji("⚫"),
        new StringSelectMenuOptionBuilder().setLabel("White").setValue("white").setEmoji("⚪")
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    const sent = await message.channel.send({ embeds: [embed], components: [row] });

    // collector that listens for select submissions forever (time: 0)
    const collector = sent.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 0
    });

    collector.on("collect", async (interaction) => {
      try {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== "color_roles") return;

        await interaction.deferReply({ ephemeral: true });

        // values will be [] if user submitted with nothing
        const selected = interaction.values; // array of 0 or 1 elements
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const allRoleIds = Object.values(roles);

        // remove all color roles first
        await member.roles.remove(allRoleIds).catch((err) => {
          console.error("Failed to remove roles:", err);
        });

        if (selected.length === 0) {
          // user deselected everything -> removed all color roles
          await interaction.editReply({ content: "✅ Removed your color roles." });
        } else {
          // add the single selected role
          const chosenKey = selected[0];
          const toAdd = roles[chosenKey];
          if (toAdd) {
            await member.roles.add(toAdd).catch((err) => {
              console.error("Failed to add role:", err);
            });
            const pretty = chosenKey.charAt(0).toUpperCase() + chosenKey.slice(1);
            await interaction.editReply({ content: `✅ Added **${pretty}** role.` });
          } else {
            await interaction.editReply({ content: "❌ Unknown role selected." });
          }
        }
      } catch (err) {
        console.error("Role selector error:", err);
        try {
          await interaction.editReply({ content: "Something went wrong while updating roles." });
        } catch {}
      }
    });
  }
};
