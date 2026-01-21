import songControls from '../utils/songControls.js';
import timeoutActions from '../utils/timeoutActions.js';

export default {
  name: 'stop',
  timeoutAction: timeoutActions.TIMEOUT_START,
  description: 'Stops all playing songs.',
  needsVoiceChannel: true,
  execute(server, message) {
    return songControls.stopSongs(server);
  }
};
