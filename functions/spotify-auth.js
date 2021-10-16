// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");

// Spotify SDKs to acess the Users Spotify
const SpotifyWebApi = require("spotify-web-api-node");

const scopes = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
];
const credidentials = {
  redirectUri:
    "https://us-central1-xc-playlist.cloudfunctions.net/spotifyAuth-callback",
  clientId: "d869ced3e5734fde862839bba66b096a",
  clientSecret: "59555faa8f734aed9d6d48f5d180a211",
};

exports.auth = functions.https.onRequest(async (req, res) => {
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
