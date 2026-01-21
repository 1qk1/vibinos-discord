/**
 * Shoukaku-based song controls
 * This is a compatibility wrapper that provides the same interface
 * as the old songControls.js but uses Shoukaku/Lavalink internally
 */

// Global reference to ShoukakuPlayback instance
let shoukakuPlayback = null;

/**
 * Initialize the song controls with ShoukakuPlayback instance
 * This should be called once during bot startup
 */
export function initialize(shoukakuManager) {
  if (!shoukakuPlayback && shoukakuManager) {
    // Import dynamically to avoid circular dependencies
    import('./audio/ShoukakuPlayback.js').then(module => {
      const ShoukakuPlayback = module.default;
      shoukakuPlayback = new ShoukakuPlayback(shoukakuManager);
      console.log('✅ ShoukakuPlayback initialized for song controls');
    }).catch(error => {
      console.error('Failed to initialize ShoukakuPlayback:', error);
    });
  }
}

/**
 * Get the ShoukakuPlayback instance
 * Returns null if not initialized yet
 */
function getPlayback() {
  if (!shoukakuPlayback) {
    console.warn('ShoukakuPlayback not initialized yet. Audio commands may not work.');
  }
  return shoukakuPlayback;
}

/**
 * Play the next song in the queue
 * @param {Server} server - Server instance
 */
const nextSong = (server) => {
  const playback = getPlayback();
  if (playback) {
    return playback.nextSong(server);
  } else {
    // Fallback: just update queue index
    server.setNextSong();
    if (server.queue.length > server.queueIndex) {
      console.warn('ShoukakuPlayback not ready, cannot play next song');
    } else {
      stopSongs(server);
      server.addTimer();
    }
  }
};

/**
 * Play a specific song
 * @param {Server} server - Server instance
 * @param {Song} song - Song to play
 */
const playSong = async (server, song) => {
  const playback = getPlayback();
  if (playback) {
    return playback.playSong(server, song);
  } else {
    console.error('ShoukakuPlayback not initialized, cannot play song');
    server.playing = false;
  }
};

/**
 * Stop all playback and clear queues
 * @param {Server} server - Server instance
 */
const stopSongs = (server) => {
  const playback = getPlayback();
  if (playback) {
    return playback.stopSongs(server);
  } else {
    // Basic cleanup without Shoukaku
    server.queue = [];
    server.convertQueue = [];
    server.playing = false;
    server.queueIndex = -1;
    server.dispatcher = null;
    server.audioPlayer = null;
  }
};

/**
 * Pause playback
 * @param {Server} server - Server instance
 * @param {boolean} pause - Whether to pause (true) or resume (false)
 */
const pause = async (server, pause = true) => {
  const playback = getPlayback();
  if (playback) {
    return playback.pause(server, pause);
  }
};

/**
 * Set volume
 * @param {Server} server - Server instance
 * @param {number} volume - Volume level (0-100)
 */
const setVolume = async (server, volume) => {
  const playback = getPlayback();
  if (playback) {
    return playback.setVolume(server, volume);
  }
};

/**
 * Seek to position in current track
 * @param {Server} server - Server instance
 * @param {number} position - Position in milliseconds
 */
const seek = async (server, position) => {
  const playback = getPlayback();
  if (playback) {
    return playback.seek(server, position);
  }
};

export default {
  playSong,
  nextSong,
  stopSongs,
  pause,
  setVolume,
  seek,
  initialize
};