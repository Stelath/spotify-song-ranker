// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");

// Spotify SDKs to acess the Users Spotify
const SpotifyWebApi = require("spotify-web-api-node");
const credidentials = {
  redirectUri: "http://localhost:5001/xc-playlist/us-central1/spotifyAuth-callback",
  clientId: "d869ced3e5734fde862839bba66b096a",
  clientSecret: "59555faa8f734aed9d6d48f5d180a211",
};

const playlistMergeSort = require("./logic/spotify-playlist-merge-sort");

exports.updateSpotifyPlaylists = functions.https.onRequest(async (req, res) => {
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

  const playlistId = "2xRtfJesyl9OzC8JXCLmah";
  spotifyApi.getPlaylistTracks(playlistId).then(
    async (data) => {
      const songs = [];

      var i = 0;
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
          position: i,
        });

        i++;
      });

      var originalSongs;
      await admin
        .firestore()
        .collection("playlists")
        .doc("playlistID")
        .get()
        .then((snap) => {
          if (snap.exists) {
            originalSongs = snap.data().songs;
          } else {
            originalSongs = [];
          }
        });

      if (songs != originalSongs) {
        songs.forEach((song, index, songsArr) => {
          originalSongs.forEach((originalSong) => {
            if (song["id"] == originalSong["id"]) {
              songsArr[index]["ratings"] = originalSong["ratings"];
              songsArr[index]["overall_rating"] =
                originalSong["overall_rating"];
            }
          });
        });

        await admin
          .firestore()
          .collection("playlists")
          .doc("playlistID")
          .set({
            songs: songs,
            playlist_id: "2xRtfJesyl9OzC8JXCLmah",
          })
          .then(functions.logger.log("Updated playlist in firestore"));

        // Update actual spotify playlist
        var i = 0;
        playlistMergeSort.mergeSortPlaylist(songs).forEach(async (song) => {
          console.log("Reordering Playlist...");

          await spotifyApi
            .reorderTracksInPlaylist(
              playlistId,
              song["position"] + i,
              i
            )
            .then(
              (data) => {
                console.log("Tracks reordered in playlist!");
              },
              (err) => {
                console.log("Something went wrong!", err);
              }
            );
          
          i++;
        });
      }
    },
    (err) => {
      functions.logger.error("Something went wrong!", err);
    }
  );

  res.json({ result: "Got spotify playlist successfully!" });
});