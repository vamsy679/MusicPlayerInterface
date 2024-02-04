import React from "react";
import "./SongRow.css";
import PlayIcon from "../Icons/PlayIcon";
import PauseIcon from "../Icons/PauseIcon";

function SongRow({
  song_name,
  cover,
  artists,
  time,
  date,
  paused,
  handleClick,
}) {
  return (
    <div className="songRow">
      <img className="songImg" src={cover} alt="" />
      <div className="songDetails">
        <div className="song">
          <span onClick={handleClick}>{song_name}</span>
        </div>
        <div className="artist">
          <span>
           {artists}
          </span>
        </div>
      </div>

      <span>{date}</span>
      <div className="date">
        <span>{time}</span>
      </div>
      {/* <button type="button" className="playlist-button" onClick={()=>{}}>
        {paused ? <PauseIcon /> : <PlayIcon />}
      </button> */}
    </div>
  );
}

export default SongRow;
