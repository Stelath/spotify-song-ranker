import { doc, getDoc } from "firebase/firestore";

// Get a list of songs from the firestore database
export async function getSongs(db) {
  const playlistRef = doc(db, "playlists", "playlistID");
  const playlistSnap = await getDoc(playlistRef);

  if (playlistSnap.exists()) {
    const playlist = playlistSnap.data();
    return playlist.songs;
  } else {
    // doc.data() will be undefined in this case
    console.log("No such playlist!");
    return false;
  }
}

export function getRandomSongData(songList) {
  console.log("songs:", songList);
  const song = songList[Math.floor(Math.random() * songList.length)];
  console.log("Song:", song);

  const songData = {
    title: song["title"],
    artist: song["artist"],
    albumCover: song["album_cover"],
    overallRating: song["overall_rating"],
  };

  return songData;
}
