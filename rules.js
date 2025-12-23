// rules.js
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType
} from "discord.js";

export default {
  name: "rules",
  async execute(message) {
    if (!message.guild) return message.reply("This command only works in servers.");

    const header = new EmbedBuilder()
      .setTitle("📜 Server Rules Menu")
      .setDescription("Pick a category below to view the rules, examples, and exact consequences.")
      .setColor("#5100ff");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("minor_rules")
        .setLabel("🟢 Minor Rules")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("normal_rules")
        .setLabel("🔵 Normal Rules")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("nightmare_rules")
        .setLabel("🔴 Nightmare Rules")
        .setStyle(ButtonStyle.Danger)
    );

    const sent = await message.channel.send({ embeds: [header], components: [row] });

    const collector = sent.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 0 // run indefinitely
    });

    collector.on("collect", async (interaction) => {
      try {
        if (!interaction.isButton()) return;
        await interaction.deferReply({ ephemeral: true });

        let embed;

        switch (interaction.customId) {
          // ---------- MINOR ----------
          case "minor_rules":
            embed = new EmbedBuilder()
              .setTitle("🟢 Minor Rules — What & Consequences")
              .setColor("#43b581")
              .addFields(
                { name: "What this covers", value: "Small, common-sense rules that keep chat readable and friendly." },
                { name: "Examples", value:
                  "- Spamming emojis or one-word messages repeatedly\n" +
                  "- Posting short memes in the wrong channel\n" +
                  "- Mild language (not targeted at someone)\n"
                },
                { name: "Enforcement (Typical)", value:
                  "1. **First offense:** Warning (private)\n" +
                  "2. **Repeat:** Short timeout (10–30 minutes)\n" +
                  "3. **Persistent:** Longer timeout or escalate to Normal rules penalties\n"
                }
              );
            break;

          // ---------- NORMAL ----------
          case "normal_rules":
            embed = new EmbedBuilder()
              .setTitle("🔵 Normal Rules — What & Consequences")
              .setColor("#5865f2")
              .addFields(
                { name: "What this covers", value: "Behavior that harms community safety or violates Discord TOS." },
                { name: "Examples", value:
                  "- Targeted harassment, slurs, or hate speech\n" +
                  "- Sharing mildly NSFW content in non-NSFW channels\n" +
                  "- Impersonation of staff or other users\n" +
                  "- Repeatedly evading minor rules after warnings\n"
                },
                { name: "Enforcement (Typical)", value:
                  "1. **First offense:** Formal warning + evidence log\n" +
                  "2. **Second:** Timeout (1 hour → 24 hours) and removal of offending messages\n" +
                  "3. **Severe / repeated:** 3-day ban → 7-day ban\n"
                }
              );
            break;

          // ---------- NIGHTMARE ----------
          case "nightmare_rules":
            embed = new EmbedBuilder()
              .setTitle("🔴 Nightmare Rules — What & Consequences")
              .setColor("#ed4245")
              .addFields(
                { name: "What this covers", value: "Extremely harmful or illegal actions. Zero tolerance." },
                { name: "Examples", value:
                  "- **Phishing / credential harvesting** (sharing fake verification links) — *example:* posting a link that asks users to enter Discord credentials.\n" +
                  "- **Doxing** (sharing private personal info)\n" +
                  "- **Threats of violence, sexual assault, or illegal coordination**\n" +
                  "- **Major raids, hacking attempts, or distributing malware**\n"
                },
                { name: "Enforcement (Absolute)", value:
                  "1. **Immediate action:** Permanent ban (no warnings) + evidence saved\n" +
                  "2. **If applicable:** Report to Discord Trust & Safety (for phishing, doxing, malware)\n" +
                  "3. **Ban evasion:** Extended ban and server-wide blacklist\n"
                }
              )
              .setFooter({ text: "Phishing note: any fake verification or login links are instant permaban." });
            break;

          default:
            await interaction.editReply({ content: "Unknown option." });
            return;
        }

        await interaction.editReply({ embeds: [embed] });

      } catch (err) {
        console.error("rules button error:", err);
        try { await interaction.editReply({ content: "Something went wrong showing those rules." }); } catch {}
      }
    });

    // optional: collector.on('end', ...) if you want to disable buttons after N ms
  }
};
