import { collection, getDocs } from 'firebase/firestore';

export function getRandomSong(songList) {
    let songs = Array.from(songList);
    return songs[Math.floor(Math.random() * songs.length)];
}

// Get a list of songs from the firestore database
export async function getSongs(db) {
    const songsCol = collection(db, "songs");
    const songSnapshot = await getDocs(songsCol);
    const songList = songSnapshot.docs.map((doc) => doc.data());
    return songList;
}