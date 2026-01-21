import Song from '../models/song.js';

/**
 * Search for songs using Shoukaku/Lavalink
 * This replaces the old ytdl-based search functionality
 */
export default class ShoukakuSearch {
  constructor(shoukakuManager) {
    this.shoukaku = shoukakuManager;
  }

  /**
   * Search for a song using Lavalink
   * @param {Object} song - Song object with name or url
   * @returns {Promise<Song>} - Resolved song with metadata
   */
  async search(song) {
    try {
      let query = song.name;
      let isUrl = false;

      // Check if it's a URL (YouTube, SoundCloud, etc.)
      if (song.url) {
        // Check for common URL patterns
        const urlPatterns = [
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/,
          /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/,
          /(?:https?:\/\/)?(?:www\.)?spotify\.com\/(?:track|playlist|album)\/[a-zA-Z0-9]+/,
          /(?:https?:\/\/)?(?:open\.spotify\.com)\/(?:track|playlist|album)\/[a-zA-Z0-9]+/
        ];

        for (const pattern of urlPatterns) {
          if (pattern.test(song.url)) {
            query = song.url;
            isUrl = true;
            break;
          }
        }
      }

      // Search using Lavalink
      const result = await this.shoukaku.search(query, isUrl ? 'youtube' : 'ytsearch');

      if (!result || result.loadType === 'LOAD_FAILED' || result.loadType === 'NO_MATCHES') {
        throw new Error(`No results found for: ${query}`);
      }

      let track;
      let trackName;

      switch (result.loadType) {
        case 'TRACK_LOADED':
        case 'SEARCH_RESULT':
          track = result.tracks[0];
          trackName = track.info.title;
          break;
        case 'PLAYLIST_LOADED':
          // For playlists, use the first track
          track = result.tracks[0];
          trackName = track.info.title;
          break;
        default:
          throw new Error(`Unexpected load type: ${result.loadType}`);
      }

      // Create song object with Lavalink track data
      const songData = {
        url: track.info.uri || query,
        name: trackName,
        addedBy: song.addedBy,
        track: track.encoded, // Store encoded track for playback
        duration: track.info.length,
        identifier: track.info.identifier
      };

      return new Song(songData);
    } catch (error) {
      console.error('Error searching with Shoukaku:', error);
      throw error;
    }
  }

  /**
   * Validate if a string is a YouTube URL (for compatibility)
   * @param {string} url - URL to validate
   * @returns {boolean} - True if it's a YouTube URL
   */
  static isYouTubeUrl(url) {
    const youtubePatterns = [
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/,
      /^https?:\/\/youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
      /^https?:\/\/music\.youtube\.com\/(?:watch\?v=|playlist\?list=)/
    ];

    return youtubePatterns.some(pattern => pattern.test(url));
  }

  /**
   * Extract video ID from YouTube URL (for compatibility)
   * @param {string} url - YouTube URL
   * @returns {string|null} - Video ID or null
   */
  static getYouTubeId(url) {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }
}