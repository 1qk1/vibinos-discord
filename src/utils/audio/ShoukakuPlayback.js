import yts from 'yt-search';

/**
 * Shoukaku-based playback system
 * Replaces the old ytdl-based songControls.js
 */
export default class ShoukakuPlayback {
  constructor(shoukakuManager) {
    this.shoukaku = shoukakuManager;
  }

  /**
   * Play the next song in the queue
   * @param {Server} server - Server instance
   */
  async nextSong(server) {
    server.setNextSong();

    if (server.queue.length > server.queueIndex) {
      const song = server.queue[server.queueIndex];
      await this.playSong(server, song);
    } else {
      this.stopSongs(server);
      server.addTimer();
    }
  }

  /**
   * Play a specific song
   * @param {Server} server - Server instance
   * @param {Song} song - Song to play
   */
  async playSong(server, song) {
    server.removeTimer();
    server.playing = true;

    try {
      let track;
      let songName = song.name || 'Unknown Song';

      // Get the player for this guild
      const player = await this.shoukaku.getPlayer(server.id);
      if (!player) {
        throw new Error('Player not found. Please join a voice channel first.');
      }

      // If song has a track encoded (from Lavalink search), use it
      if (song.track) {
        track = song.track;
      } else if (song.name) {
        // Search by song name using Lavalink - this is more reliable than video ID
        const result = await this.shoukaku.search(song.name, 'ytsearch');
        if (!result.tracks || result.tracks.length === 0) {
          // If search by name fails, try using URL or videoId as fallback
          const fallbackQuery = song.videoId || song.url;
          if (fallbackQuery) {
            const fallbackResult = await this.shoukaku.search(fallbackQuery, 'youtube');
            if (!fallbackResult.tracks || fallbackResult.tracks.length === 0) {
              throw new Error(`No results found for: ${song.name} (tried: ${fallbackQuery})`);
            }
            track = fallbackResult.tracks[0].encoded;
            songName = fallbackResult.tracks[0].info.title;
          } else {
            throw new Error(`No results found for: ${song.name}`);
          }
        } else {
          track = result.tracks[0].encoded;
          songName = result.tracks[0].info.title;

          // Update song with track data for future reference
          song.track = track;
          song.name = songName;
        }
      } else if (song.url || song.videoId) {
        // Fallback: try using URL or videoId directly
        const query = song.videoId || song.url;
        const result = await this.shoukaku.search(query, 'youtube');
        if (!result.tracks || result.tracks.length === 0) {
          throw new Error(`No results found for: ${query}`);
        }
        track = result.tracks[0].encoded;
        songName = result.tracks[0].info.title;
      } else {
        throw new Error('Song has neither name nor URL');
      }

      // Apply nightcore filters if enabled
      if (server.nightcore) {
        await this.applyNightcoreFilters(server, player);
      }

      // Play the track
      await this.shoukaku.play(server.id, { encoded: track });

      // Send playback notification
      if (server.channel) {
        const nightcoreText = server.nightcore ? ' in nightcore mode' : '';
        server.channel.send(`Playing **\`${songName}\`**${nightcoreText}. Let's get funky.`);
      }

      console.log(`▶️ Started playing: ${songName} in guild ${server.id}`);

    } catch (error) {
      console.error('Error playing song:', error);
      server.playing = false;

      // Try to skip to next song on error
      setTimeout(() => {
        try {
          this.nextSong(server);
        } catch (skipError) {
          console.error('Failed to skip song after play error:', skipError);
        }
      }, 2000);
    }
  }

  /**
   * Apply nightcore filters to player
   * @param {Server} server - Server instance
   * @param {Object} player - Shoukaku player
   */
  async applyNightcoreFilters(server, player) {
    const nightcoreLevel = server.nightcore;

    // Different nightcore levels with different pitch/tempo
    const nightcoreFilters = {
      1: { timescale: { speed: 1.2, pitch: 1.2, rate: 1.0 } },
      2: { timescale: { speed: 1.3, pitch: 1.3, rate: 1.0 } },
      3: { timescale: { speed: 1.45, pitch: 1.45, rate: 1.0 } }
    };

    if (nightcoreFilters[nightcoreLevel]) {
      await player.setFilters(nightcoreFilters[nightcoreLevel]);
    }
  }

  /**
   * Stop all playback and clear queues
   * @param {Server} server - Server instance
   */
  stopSongs(server) {
    // Clear queues
    server.queue = [];
    server.convertQueue = [];
    server.playing = false;
    server.queueIndex = -1;

    // Stop playback
    if (this.shoukaku) {
      this.shoukaku.stop(server.id).catch(error => {
        console.error('Error stopping playback:', error);
      });
    }

    // Clear nightcore filters
    if (server.player) {
      server.player.setFilters({}).catch(() => { });
    }

    // Clear dispatcher reference for compatibility
    server.dispatcher = null;
    server.audioPlayer = null;
  }

  /**
   * Pause playback
   * @param {Server} server - Server instance
   * @param {boolean} pause - Whether to pause (true) or resume (false)
   */
  async pause(server, pause = true) {
    if (this.shoukaku) {
      await this.shoukaku.pause(server.id, pause);
    }
  }

  /**
   * Set volume
   * @param {Server} server - Server instance
   * @param {number} volume - Volume level (0-100)
   */
  async setVolume(server, volume) {
    if (this.shoukaku) {
      await this.shoukaku.setVolume(server.id, volume);
    }
  }

  /**
   * Seek to position in current track
   * @param {Server} server - Server instance
   * @param {number} position - Position in milliseconds
   */
  async seek(server, position) {
    if (this.shoukaku) {
      await this.shoukaku.seek(server.id, position);
    }
  }
}