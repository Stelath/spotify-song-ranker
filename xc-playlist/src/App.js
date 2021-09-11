// Import SDKs
import React, { useState, useEffect } from "react";
import firebaseApp from "./logic/firebase";
import { getFirestore } from 'firebase/firestore';

// Import Components
import Rating from "./components/Rating";

// Import logic
import {getSongs, getRandomSong} from "./logic/songs"

function App() {
  // Get the firebase firestore database
  const db = getFirestore(firebaseApp);

  // Get a list of songs in order to save on memory
  const songList = getSongs(db);

  // Create the states for the album cover, artist, and title of a random song on the playlist
  const [albumCover, setAlbumCover] = useState(
    "https://i.scdn.co/image/ab67616d0000b2734a052b99c042dc15f933145b"
  );
  const [songTitle, setSongTitle] = useState("Africa");
  const [artist, setArtist] = useState("TOTO");

  useEffect(() => {
    songList.then(data => 
      {
        updateSong();
      })
  }, []);

  function updateSong()
  {
    const song = getRandomSong(data);
    setAlbumCover(song.albumCover);
    setSongTitle(song.songTitle);
    setArtist(song.artist);
  }

  return (
    <div className="App">
      <div className="Content">
        <img id="albumCover" alt="Album Cover" src={albumCover} />
        <h2>{songTitle}</h2>
        <h3>By: {artist}</h3>
        <Rating />
      </div>
    </div>
  );
}

export default App;
