import { collection, getDocs } from "firebase/firestore";

function getRandomFromList(list) {
  let listArray = Array.from(list);
  return listArray[Math.floor(Math.random() * listArray.length)];
}

// Get a list of songs from the firestore database
export async function getSongs(db) {
    console.log("getting songs");
  const songsCol = collection(db, "songs");
  const songSnapshot = await getDocs(songsCol);
  const songList = songSnapshot.docs.map((doc) => doc.data());
  return songList;
}

export function getRandomSongData(songList) {
  const song = getRandomFromList(songList);
    // const albumCover = song.albumCover;
    // const songTitle = song.songTitle;
    // const artist = song.artist;
}
