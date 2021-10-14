const admin = require("firebase-admin");
admin.initializeApp();

// Export Functions
exports.spotifyAuth = require('./spotify-auth');
exports.updateSpotifyPlaylists = require('./update-spotify-playlists').updateSpotifyPlaylists;
exports.firestorePlaylistListeners = require('./firestore-playlist-listeners');

// exports.updateSpotifyPlaylists = functions.pubsub
//   .schedule('* * * * *')
//   .onRun((context) => {
//     functions.logger.log('This will be run every 1 minutes!');
//     return null;
//   });