import { joinVoiceChannel, createAudioPlayer } from "@discordjs/voice";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import ytSearch from "yt-search";
import { queue, playSong } from "./musicPlayer.js"; // ES Module import

export default {
  name: "play",
  async execute(message, args) {
    try {
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel)
        return message.reply("❌ You must join a voice channel first!");

      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has("Connect") || !permissions.has("Speak"))
        return message.reply(
          "❌ I need permission to connect and speak in your voice channel!"
        );

      const query = args.join(" ");
      if (!query) return message.reply("❌ Please provide a song name!");

      const result = await ytSearch(query);
      if (!result.videos.length) return message.reply("❌ No results found!");

      const song = {
        title: result.videos[0].title,
        url: result.videos[0].url,
        duration: result.videos[0].timestamp,
        thumbnail: result.videos[0].thumbnail,
      };

      let serverQueue = queue.get(message.guild.id);

      if (!serverQueue) {
        const player = createAudioPlayer();

        // Join the voice channel
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
          selfDeaf: false, // optional for debugging
        });

        console.log(`✅ Bot joined VC: ${voiceChannel.name}`);

        serverQueue = {
          voiceChannel,
          connection,
          player,
          songs: [],
          volume: 0.5,
          loop: false,
          resource: null,
        };

        queue.set(message.guild.id, serverQueue);
        connection.subscribe(player);
      }

      // Add the song to the queue
      serverQueue.songs.push(song);

      // Send the embed with controls
      const embed = new EmbedBuilder()
        .setTitle("🎶 Music Player")
        .setDescription(`**${song.title}**`)
        .setThumbnail(song.thumbnail)
        .addFields(
          { name: "Duration", value: song.duration || "Unknown", inline: true },
          { name: "Queue Position", value: `${serverQueue.songs.length}`, inline: true }
        )
        .setColor(0x1db954);

      const controls1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("pause").setLabel("⏸").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("resume").setLabel("▶").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("skip").setLabel("⏭").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("stop").setLabel("⏹").setStyle(ButtonStyle.Danger)
      );

      const controls2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("loop").setLabel("🔁 Loop").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("queue").setLabel("📜 Queue").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("volup").setLabel("🔊").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("voldown").setLabel("🔉").setStyle(ButtonStyle.Secondary)
      );

      await message.channel.send({
        embeds: [embed],
        components: [controls1, controls2],
      });

      // If first song, play it
      if (serverQueue.songs.length === 1) {
        playSong(message.guild, serverQueue.songs[0], message.channel);
      }
    } catch (error) {
      console.error("❌ Error in play command:", error);
      message.reply("❌ Something went wrong while trying to play music!");
    }
  },
};