import { doc, getDoc } from "firebase/firestore";

// Get a list of songs from the firestore database
export async function getSongs(db) {
  console.log("Got new playlist");
  const playlistRef = doc(db, "playlists", "playlistID");
  const playlistSnap = await getDoc(playlistRef);

  if (playlistSnap.exists()) {
    const playlist = playlistSnap.data();
    return playlist;
  } else {
    // doc.data() will be undefined in this case
    console.log("No such playlist!");
    return false;
  }
}

export function getRandomSongData(songList) {
  const song = songList[Math.floor(Math.random() * songList.length)];

  const songData = {
    title: song["songTitle"],
    artist: song["artist"],
    albumCover: song["albumCover"],
    overallRating: song["overallRating"],
  };

  return songData;
}
