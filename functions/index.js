const admin = require("firebase-admin");
admin.initializeApp();

// Export Functions
exports.spotifyAuth = require("./spotify-auth");
exports.updateSpotifyPlaylists =
  require("./update-spotify-playlists").updateSpotifyPlaylists;
exports.firestorePlaylistListeners = require("./firestore-playlist-listeners");
