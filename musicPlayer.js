import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from "@discordjs/voice";
import ytdl from "ytdl-core";

const queue = new Map();

async function playSong(guild, song, textChannel) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.connection.destroy();
    queue.delete(guild.id);
    return;
  }

  const stream = ytdl(song.url, {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  });

  const resource = createAudioResource(stream, {
    inlineVolume: true
  });

  resource.volume.setVolume(serverQueue.volume);
  serverQueue.resource = resource;

  serverQueue.player.play(resource);

  serverQueue.player.once(AudioPlayerStatus.Idle, () => {
    if (serverQueue.loop) {
      playSong(guild, serverQueue.songs[0], textChannel);
    } else {
      serverQueue.songs.shift();
      playSong(guild, serverQueue.songs[0], textChannel);
    }
  });
}

export { queue, playSong };