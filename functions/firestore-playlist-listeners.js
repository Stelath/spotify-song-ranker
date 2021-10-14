// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");

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
