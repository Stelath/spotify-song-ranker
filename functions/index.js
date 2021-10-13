// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Spotify SDKs to acess the Users Spotify
const SpotifyWebApi = require("spotify-web-api-node");

// exports.scheduledFunction = functions.pubsub
//   .schedule('* * * * *')
//   .onRun((context) => {
//     functions.logger.log('This will be run every 1 minutes!');
//     return null;
//   });
const scopes = ["playlist-read-private", "playlist-modify-private"];
const credidentials = {
  redirectUri: "http://localhost:5001/xc-playlist/us-central1/callback",
  clientId: "d869ced3e5734fde862839bba66b096a",
  clientSecret: "59555faa8f734aed9d6d48f5d180a211",
};

exports.spotifyAuth = functions.https.onRequest(async (req, res) => {
  const spotifyApi = new SpotifyWebApi(credidentials);
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

exports.callback = functions.https.onRequest(async (req, res) => {
  const spotifyApi = new SpotifyWebApi(credidentials);

  const error = req.query.error;
  const code = req.query.code;

  if (error) {
    functions.logger.error("Callback Error:", error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then(async (data) => {
      const accessToken = data.body["access_token"];
      const refreshToken = data.body["refresh_token"];
      const expiresIn = data.body["expires_in"];
      const expiresAt = expiresIn - 120 + Math.floor(Date.now() / 1000);

      // Push the new message into Firestore using the Firebase Admin SDK.
      await admin.firestore().collection("spotifyAPIKeys").doc("username").set({
        refresh_token: refreshToken,
        access_token: accessToken,
        expires_at: expiresAt,
      });

      functions.logger.log(
        `Sucessfully authenticated user, access token expires in ${expiresIn} s.`
      );
      res.send("Success! You can now close the window.");
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

exports.getSpotifyPlaylist = functions.https.onRequest(async (req, res) => {
  const spotifyApi = new SpotifyWebApi(credidentials);

  await admin
    .firestore()
    .collection("spotifyAPIKeys")
    .doc("username")
    .get()
    .then(async (snap) => {
      if (snap.exists) {
        const docData = snap.data();

        const refreshToken = docData.refresh_token;
        var accessToken = docData.access_token;

        spotifyApi.setRefreshToken(refreshToken);

        if (docData.expires_at < Date.now() / 1000) {
          const data = await spotifyApi.refreshAccessToken();

          accessToken = data.body["access_token"];
          const expiresIn = data.body["expires_in"];
          const expiresAt = expiresIn - 120 + Math.floor(Date.now() / 1000);

          // Push the new Access Token into Firestore using the Firebase Admin SDK.
          await admin
            .firestore()
            .collection("spotifyAPIKeys")
            .doc("username")
            .set(
              {
                access_token: accessToken,
                expires_at: expiresAt,
              },
              { merge: true }
            );

          functions.logger.log(
            `Sucessfully refreshed access token. Expires in ${expiresIn} s.`
          );
        }

        spotifyApi.setAccessToken(accessToken);
      } else {
        functions.logger.error("Unable to get users Spotify API data");
      }
    });

  const playlistId = "5RO0m5fmEBkcwAXHAuw1zT";
  spotifyApi.getPlaylistTracks(playlistId).then(
    async (data) => {
      const songs = [];

      data.body["items"].forEach(async (song) => {
        const id = song["track"]["id"];
        const title = song["track"]["name"];
        const artist = song["track"]["artists"][0]["name"];
        const albumCover = song["track"]["album"]["images"][0]["url"];
        const ratings = [];
        const overallRating = 0;

        songs.push({
          id: id,
          title: title,
          artist: artist,
          album_cover: albumCover,
          ratings: ratings,
          overall_rating: overallRating,
        });
      });

      var originalSongs;
      await admin
        .firestore()
        .collection("playlists")
        .doc("username")
        .get().then((snap) => {
          if(snap.exists)
          {
            originalSongs = snap.data().songs;
          }
          else
          {
            originalSongs = [];
          }
        });

        console.log('ORIGINAL SONGS:', originalSongs);

      songs.forEach((song, index, songsArr) => {
        originalSongs.forEach((originalSong) => {
          if (song["id"] == originalSong["id"]) {
            songsArr[index]["ratings"] = originalSong["ratings"];
            songsArr[index]["overall_rating"] = originalSong["overall_rating"];
          }
        });
      });

      await admin
        .firestore()
        .collection("playlists")
        .doc("username")
        .set({
          songs: songs,
          playlist_id: "5RO0m5fmEBkcwAXHAuw1zT",
        })
        .then(functions.logger.log("Updated playlist in firestore"));
    },
    (err) => {
      functions.logger.error("Something went wrong!", err);
    }
  );

  res.json({ result: "Got spotify playlist successfully!" });
});

// Listens for new messages added to /playlists/:documentId/ratings and updates
// the overall rating to /playlists/:documentId/overall_rating
exports.updateOverallRating = functions.firestore
  .document("/songs/{documentId}")
  .onUpdate((change, context) => {
    // Grab the current value of what was written to Firestore.
    const ratings = change.after.data().ratings;
    const overallRating = ratings.reduce((a, b) => a + b) / ratings.length;

    // Access the parameter `{documentId}` with `context.params`
    functions.logger.log(
      "Updateing Rating",
      context.params.documentId,
      overallRating
    );

    // Returns the promise to set overall_rating to the new average
    return snap.ref.set({ overall_rating: overallRating }, { merge: true });
  });