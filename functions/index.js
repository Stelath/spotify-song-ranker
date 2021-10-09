// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Spotify SDKs to acess the Users Spotify
const SpotifyWebApi = require("spotify-web-api-node");

// exports.scheduledFunction = functions.pubsub
//   .schedule("* * * * *")
//   .onRun((context) => {
//     functions.logger.log("This will be run every 1 minutes!");
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
      await admin.firestore().collection("spotifyAPIKeys").doc("stelath").set({
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
    .doc("stelath")
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
            .doc("stelath")
            .set({
              access_token: accessToken,
              expires_at: expiresAt,
            });

          functions.logger.log(
            `Sucessfully refreshed access token. Expires in ${expiresIn} s.`
          );
        }

        spotifyApi.setAccessToken(accessToken);
      } else {
        functions.logger.error("Unable to get users Spotify API data");
      }
    });
  

  spotifyApi.getPlaylistTracks("5RO0m5fmEBkcwAXHAuw1zT").then(
    (data) => {
      console.log("Tracks data", data.items);
    },
    (err) => {
      functions.logger.error("Something went wrong!", err);
    }
  );

  res.json({result: "Got spotify playlist successfully!"});
});

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin
    .firestore()
    .collection("messages")
    .add({ original: original });
  // Send back a message that we've successfully written the message
  res.json({ result: "Message with ID: ${writeResult.id} added." });
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore
  .document("/messages/{documentId}")
  .onCreate((snap, context) => {
    // Grab the current value of what was written to Firestore.
    const original = snap.data().original;

    // Access the parameter `{documentId}` with `context.params`
    functions.logger.log("Uppercasing", context.params.documentId, original);

    const uppercase = original.toUpperCase();

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return snap.ref.set({ uppercase }, { merge: true });
  });
