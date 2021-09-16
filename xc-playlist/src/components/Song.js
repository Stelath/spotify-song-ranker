// Import SDKs
import React, { useState, useEffect } from "react";

// Import Components
import Rating from "./Rating";

const Song = (props) => {
  let [animation, setAnimation] = useState(props.entering ? "backInRight":"backOutLeft");

  useEffect(() => {
    setAnimation(props.entering ? "backInRight":"backOutLeft");
  },[props.entering])

  function ratePressed(rating) {
    setAnimation("backOutLeft");
    props.onRatePressed(rating);
  }

  return (
    <div className={"Content animate__animated animate__" + animation}>
      <img id="albumCover" alt="Album Cover" src={props.albumCover} />
      <h2>{props.songTitle}</h2>
      <h3>By: {props.artist}</h3>
      <Rating onRatePressed={ratePressed} initialRating={props.initialRating}/>
    </div>
  );
};

export default Song;
