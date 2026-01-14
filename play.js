import { joinVoiceChannel, createAudioPlayer } from "@discordjs/voice";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import ytSearch from "yt-search";
import { queue, playSong } from "./musicPlayer.js"; // ✅ ES Module import

export default {
  name: "play",
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply("Join a voice channel first!");

    const query = args.join(" ");
    if (!query) return message.reply("Give a song name!");

    const result = await ytSearch(query);
    if (!result.videos.length) return message.reply("No results found!");

    const song = {
      title: result.videos[0].title,
      url: result.videos[0].url,
      duration: result.videos[0].timestamp,
      thumbnail: result.videos[0].thumbnail,
    };

    let serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
      const player = createAudioPlayer();
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      serverQueue = {
        voiceChannel,
        connection,
        player,
        songs: [],
        volume: 0.5,
        loop: false,
      };

      queue.set(message.guild.id, serverQueue);
      connection.subscribe(player);
    }

    serverQueue.songs.push(song);

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

    if (serverQueue.songs.length === 1) {
      playSong(message.guild, serverQueue.songs[0], message.channel);
    }
  },
};