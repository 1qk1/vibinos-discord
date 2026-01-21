import dytdl from 'discord-ytdl-core';
import ytdl from 'ytdl-core';
import songControls from '../songControls.js';
import * as Sentry from "@sentry/node";

// Workaround for YouTube signature extraction issues
const getYouTubeStream = (input, server, extraParams = {}) => {
  const options = {
    filter: "audioonly",
    opusEncoded: true,
    highWaterMark: 1 << 25,
    quality: 'highestaudio',
    requestOptions: {
      headers: {
        // Use a common user agent to avoid detection
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
      }
    },
    ...extraParams
  };

  try {
    // First try with discord-ytdl-core
    const stream = dytdl(input, options);

    stream.on('error', (error) => {
      console.error('YouTube stream error (discord-ytdl-core):', error.message);
      Sentry.captureException(error);

      // Try to skip to next song if available
      if (server && server.queue && server.queue.length > 0) {
        setTimeout(() => {
          try {
            songControls.nextSong(server);
          } catch (skipError) {
            console.error('Failed to skip song after error:', skipError);
          }
        }, 1000);
      }

      // Destroy stream to prevent memory leaks
      try {
        stream.destroy();
      } catch (destroyError) {
        // Ignore destroy errors
      }
    });

    return stream;
  } catch (error) {
    console.error('Failed to create stream with discord-ytdl-core:', error.message);

    // Fallback to regular ytdl-core with different options
    try {
      console.log('Trying fallback with ytdl-core...');
      const fallbackOptions = {
        filter: "audioonly",
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          }
        }
      };

      const stream = ytdl(input, fallbackOptions);

      stream.on('error', (fallbackError) => {
        console.error('YouTube stream error (ytdl-core fallback):', fallbackError.message);
        Sentry.captureException(fallbackError);

        if (server && server.queue && server.queue.length > 0) {
          setTimeout(() => {
            try {
              songControls.nextSong(server);
            } catch (skipError) {
              console.error('Failed to skip song after fallback error:', skipError);
            }
          }, 1000);
        }
      });

      return stream;
    } catch (fallbackError) {
      console.error('Both YouTube stream methods failed:', fallbackError.message);
      Sentry.captureException(fallbackError);
      throw fallbackError;
    }
  }
};

export default getYouTubeStream;