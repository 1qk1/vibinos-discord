import { Shoukaku, Connectors } from 'shoukaku';

class ShoukakuManager {
  constructor(client) {
    this.client = client;
    this.nodes = [
      {
        name: 'lavalink',
        url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`,
        auth: process.env.LAVALINK_PASSWORD,
        secure: process.env.LAVALINK_SECURE === 'true'
      }
    ];

    this.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), this.nodes, {
      moveOnDisconnect: false,
      resume: false,
      resumeTimeout: 30,
      reconnectTries: 2,
      restTimeout: 10000
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.shoukaku.on('ready', (name) => {
      console.log(`✅ Lavalink node ${name} connected`);
    });

    this.shoukaku.on('error', (name, error) => {
      console.error(`❌ Lavalink node ${name} error:`, error);
    });

    this.shoukaku.on('close', (name, code, reason) => {
      console.warn(`⚠️ Lavalink node ${name} closed: ${code} ${reason}`);
    });

    this.shoukaku.on('disconnect', (name, players, moved) => {
      console.warn(`🔌 Lavalink node ${name} disconnected`);
      if (moved) return;
      players.forEach(player => player.connection.disconnect());
    });
  }

  async getPlayer(guildId) {
    return this.shoukaku.players.get(guildId);
  }

  async createPlayer(guildId, voiceChannelId, textChannelId) {
    const existingPlayer = await this.getPlayer(guildId);
    if (existingPlayer) return existingPlayer;

    const player = await this.shoukaku.joinVoiceChannel({
      guildId,
      channelId: voiceChannelId,
      shardId: 0,
      deaf: true,
      mute: false
    });

    player.textChannelId = textChannelId;

    // Set up player event listeners
    player.on('start', () => {
      console.log(`▶️ Started playing in guild ${guildId}`);
    });

    player.on('end', (data) => {
      console.log(`⏹️ Playback ended in guild ${guildId}:`, data.reason);
      // Emit event for queue to handle next song
      this.client.emit('trackEnd', guildId, data);
    });

    player.on('closed', (data) => {
      console.log(`🔌 Player closed in guild ${guildId}:`, data.reason);
      this.client.emit('playerClosed', guildId, data);
    });

    player.on('exception', (data) => {
      console.error(`❌ Player exception in guild ${guildId}:`, data);
      this.client.emit('playerException', guildId, data);
    });

    player.on('update', (data) => {
      // Player state update (position, paused, etc.)
      this.client.emit('playerUpdate', guildId, data);
    });

    player.on('stuck', (data) => {
      console.warn(`⚠️ Player stuck in guild ${guildId}:`, data);
      this.client.emit('playerStuck', guildId, data);
    });

    player.on('resumed', () => {
      console.log(`🔁 Player resumed in guild ${guildId}`);
    });

    return player;
  }

  async destroyPlayer(guildId) {
    const player = await this.getPlayer(guildId);
    if (player) {
      await player.connection.disconnect();
      this.shoukaku.players.delete(guildId);
    }
  }

  async search(query, source = 'youtube') {
    // Get the first available node
    const nodes = Array.from(this.shoukaku.nodes.values());
    if (nodes.length === 0) throw new Error('No Lavalink nodes available');

    const node = nodes[0];

    // Handle different query types
    let lavalinkQuery;

    // If query is already a video ID (11 characters, no special characters except maybe underscore/dash)
    const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;

    if (videoIdRegex.test(query)) {
      // Query is a video ID (e.g., _Cfv8nLCDHw)
      // Try multiple formats for compatibility
      // First try youtube: prefix
      lavalinkQuery = `youtube:${query}`;
      console.log(`Trying YouTube video ID format: ${lavalinkQuery} for video ID: ${query}`);
    } else if (source === 'ytsearch') {
      // It's a YouTube search query
      lavalinkQuery = `ytsearch:${query}`;
    } else {
      // Default: use the source prefix (could be a URL or other query)
      lavalinkQuery = `${source}:${query}`;
    }

    console.log(`Querying Lavalink with: ${lavalinkQuery}`);
    const result = await node.rest.resolve(lavalinkQuery);

    // Check if we got a valid result with tracks
    const hasTracks = result && result.tracks && result.tracks.length > 0;
    const isFailed = !result || result.loadType === 'LOAD_FAILED' || result.loadType === 'NO_MATCHES';

    if (!hasTracks || isFailed) {
      // If youtube: prefix didn't work or returned no tracks, try ytsearch: as fallback
      // But only for video IDs, not for search queries
      if (videoIdRegex.test(query) && !lavalinkQuery.startsWith('ytsearch:')) {
        console.log(`YouTube direct load returned no tracks, trying search: ytsearch:${query}`);
        const searchResult = await node.rest.resolve(`ytsearch:${query}`);
        if (searchResult && searchResult.tracks && searchResult.tracks.length > 0) {
          return searchResult;
        }
      }
      // For search queries (ytsearch:), return empty result instead of throwing
      // so the caller can handle the fallback
      if (lavalinkQuery.startsWith('ytsearch:')) {
        console.log(`Search returned no results for: ${query}, returning empty result`);
        return { tracks: [], loadType: 'NO_MATCHES' };
      }
      throw new Error(`No results found for: ${query}`);
    }

    return result;
  }

  async play(guildId, track, options = {}) {
    const player = await this.getPlayer(guildId);
    if (!player) throw new Error('Player not found');

    await player.playTrack({ track: track.encoded }, options);
    return player;
  }

  async stop(guildId) {
    const player = await this.getPlayer(guildId);
    if (player) {
      await player.stopTrack();
    }
  }

  async pause(guildId, pause = true) {
    const player = await this.getPlayer(guildId);
    if (player) {
      await player.setPaused(pause);
    }
  }

  async setVolume(guildId, volume) {
    const player = await this.getPlayer(guildId);
    if (player) {
      await player.setGlobalVolume(volume);
    }
  }

  async seek(guildId, position) {
    const player = await this.getPlayer(guildId);
    if (player) {
      await player.seekTo(position);
    }
  }

  async setFilters(guildId, filters) {
    const player = await this.getPlayer(guildId);
    if (player) {
      await player.setFilters(filters);
    }
  }

  async getQueue(guildId) {
    const player = await this.getPlayer(guildId);
    return player ? player.queue : [];
  }
}

export default ShoukakuManager;