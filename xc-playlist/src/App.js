// Import SDKs
import React, { useState, useEffect } from "react";
import firebaseApp from "./logic/firebase";
import { arrayRemove, getFirestore } from "firebase/firestore";
import "animate.css";

// Assets
import loadingIcon from "./assets/loading-icon.gif";

// Import Components
import Song from "./components/Song";

// Import logic
import { getSongs, getRandomSongData} from "./logic/songs";
import { rateSong } from "./logic/rating";

function App() {
  const [loading, setLoading] = useState(1);

  const[songList, setSongList] = useState(() => {
    // Get the firebase firestore database
    const db = getFirestore(firebaseApp);

    // Get a list of songs in order to save on memory
    const list = getSongs(db);

    list.then(song => {
      if(song.length != 0)
      {
        setLoading(0);
      }
      else
      {
        setLoading(2);
      }
    });

    return list;
  });

  // Create the states for the album cover, artist, and title of a random song on the playlist
  // Song 1
  const [song1, setSong1] = useState({
    title: "Africa",
    artist: "TOTO",
    albumCover:
      "https://i.scdn.co/image/ab67616d0000b2734a052b99c042dc15f933145b",
    entering:false,
  });
  const [song2, setSong2] = useState({
    title: "Africa",
    artist: "TOTO",
    albumCover:
      "https://i.scdn.co/image/ab67616d0000b2734a052b99c042dc15f933145b",
    entering:false,
  });

  useEffect(() => {
    updateSong();
  }, [songList]);

  // Create a variable to store the last song updated
  const [lastSongUpdated, setlastSongUpdated] = useState(1);
  
  function updateSong() {
    if (lastSongUpdated == 1) {
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
        initialRating: 0,
        entering: true,
      });
      setlastSongUpdated(1);
    }
  }

  function ratePressed(rating) {
    rateSong(rating);
    updateSong();
  }

  switch(loading)
  {
    case 0:
    return (
      <div className="App">
        <Song
          albumCover={song1.albumCover}
          songTitle={song1.title}
          artist={song1.artist}
          initialRating={song1.initialRating}
          onRatePressed={ratePressed}
          entering={song1.entering}
          songNum={1}
        />
        <Song
          albumCover={song2.albumCover}
          songTitle={song2.title}
          artist={song2.artist}
          initialRating={song2.initialRating}
          onRatePressed={ratePressed}
          entering={song2.entering}
          songNum={2}
        />
      </div>
    );
    
    case 1:
    return(
      <div className="App">
        <img src={loadingIcon} class="centered"></img>
        <image src={loadingIcon}></image>
      </div>
    );

    case 2:
      return(
        <div className="App">
          <h1 style={{color: "red"}}>ERROR</h1>
        </div>
      );
  }
}

export default App;
