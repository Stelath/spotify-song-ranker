// Import SDKs
import React, { useState, useEffect, useRef } from "react";
import firebaseApp from "./logic/firebase";
import { arrayRemove, getFirestore } from "firebase/firestore";
import "animate.css";

// Import Components
import Song from "./components/Song";

// Import logic
import { getSongs, getRandomSong } from "./logic/songs";
import { rateSong } from "./logic/rating";

function App() {
  // Get the firebase firestore database
  const db = getFirestore(firebaseApp);

  // Get a list of songs in order to save on memory
  const songList = getSongs(db);

  // Create the states for the album cover, artist, and title of a random song on the playlist
  // Song 1
  const [song1, setSong1] = useState({
    title: "Testing",
    artist: "The Testers",
    albumCover:
      "https://i.scdn.co/image/ab67616d0000b2734a052b99c042dc15f933145b",
    entering: true,
  });
  const [song2, setSong2] = useState({
    title: "Africa",
    artist: "TOTO",
    albumCover:
      "https://i.scdn.co/image/ab67616d0000b2734a052b99c042dc15f933145b",
    entering:false,
  });

  useEffect(() => {
    }, []);

  // Create a variable to store the last song updated
  const [lastSongUpdated, setlastSongUpdated] = useState(1);

  function updateSong() {
    if (lastSongUpdated == 1) {
      console.log("LastSongUpdated == 1" + (lastSongUpdated == 1));
      console.log("Set Song Two");
      setSong1(state => ({...state, entering: false}));
      setSong2({
        title: "Testing",
        artist: "The Testwos",
        albumCover:
          "https://i.scdn.co/image/ab67616d0000b2734a052b99c042dc15f933145b",
        entering: true,
      });
      setlastSongUpdated(2);
    } else {
      setSong2(state => ({...state, entering: false}));
      setSong1({
        title: "Testing",
        artist: "The Testones",
        albumCover:
          "https://i.scdn.co/image/ab67616d0000b2734a052b99c042dc15f933145b",
        entering: true,
      });
      setlastSongUpdated(1);
    }
    songList.then((songs) => {
      const song = getRandomSong(songs);
      // const albumCover = song.albumCover;
      // const songTitle = song.songTitle;
      // const artist = song.artist;
      
    });
  }

  function ratePressed(rating) {
    rateSong(rating);
    updateSong();
    console.log("LastSong Updated: " + lastSongUpdated + " Song One Entering: " + song1.entering);
  }

  return (
    <div className="App">
      <Song
        albumCover={song1.albumCover}
        songTitle={song1.title}
        artist={song1.artist}
        onRatePressed={ratePressed}
        entering={song1.entering}
        songNum={1}
      />
      <Song
        albumCover={song2.albumCover}
        songTitle={song2.title}
        artist={song2.artist}
        onRatePressed={ratePressed}
        entering={song2.entering}
        songNum={2}
      />
    </div>
  );
}

export default App;
