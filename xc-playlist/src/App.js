import Rateing from "./Rateing";

function App() {
  var albumCover = "https://i.scdn.co/image/ab67616d0000b2734a052b99c042dc15f933145b";
  var artist = "TOTO";
  return (
    <div className="App">
      <div className="Content">
        <img id="albumCover" alt="Album Cover" src={albumCover} />
        <h2>Africa</h2>
        <h3>By: {artist}</h3>
        <Rateing />
      </div>
    </div>
  );
}

export default App;
