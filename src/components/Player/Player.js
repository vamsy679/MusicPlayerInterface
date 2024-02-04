import React, { useEffect, useState } from "react";
import "./Player.css";
import PlayIcon from "../Icons/PlayIcon";
import PreviousIcon from "../Icons/PreviousIcon";
import NextIcon from "../Icons/NextIcon";
import useLayout from "../../Layout/useLayout";
import PauseIcon from "../Icons/PauseIcon";

function Player({ data, playerIndex }) {
  const { index, isPaused, setIndex, handlePlayClick } =
    useLayout();

  const mod = (n, m) => {
    let result = n % m;
    return result;
  };
  useEffect(() => {
    if (data && index === undefined) setIndex(data?.length - 1);
    if(playerIndex !== undefined) setIndex(playerIndex)
  }, [data, index, playerIndex, setIndex]);

  const handleNext = () => {
    setIndex((index - 1) % data?.length);
  };
  return (
    <div className="player">
      <div className="music_player">
        {playerIndex ? <div>
          <img
              className=""
              src={data[playerIndex]?.image_url}
              alt="Cover"
            />
          </div>: data?.map((item, i) => {
          const indexLeft = mod(index + 1, data?.length);
          const indexRight = mod(index - 1, data?.length);
          let className = "card";

          if (i === index) {
            className = "card card--active";
          } else if (i === indexRight) {
            className = "card card--right";
          } else if (i === indexLeft && indexLeft !== 0) {
            className = "card card--left";
          } else className = "card";

          return (
            <img
              key={item.id}
              className={className}
              src={item.image_url}
              alt="Cover"
            />
          );
        })}
        {}
      </div>
      <div className="current-song">
        <h3 className="song_name">{index ? data[index]?.song_name : ""} </h3>
        <p className="artist_name">
          {index
            ? data[index].artists.map((artist) => artist.name).join(", ")
            : ""}
        </p>

        <div className="player-buttons">
          <button
            className="prevbutton"
            type="button"
            disabled={index === data?.length - 1 ? true : false}
            onClick={() => setIndex((index + 1) % data?.length)}
          >
            <PreviousIcon />
          </button>
          <button
            className={isPaused ? "playbutton" : "playbutton-active"}
            type="button"
            onClick={handlePlayClick}
          >
            {isPaused ? <PauseIcon size={25} /> : <PlayIcon size={25} />}
          </button>
          <button
            className="nextbutton"
            type="button"
            onClick={handleNext}
            disabled={index === 0 ? true : false}
          >
            <NextIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Player;
