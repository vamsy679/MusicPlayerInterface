import React from "react";
import "./Layout.css";
import "./List.css";
import Player from "../components/Player/Player";
import useLayout from "./useLayout";
import Menu from "../components/Icons/Menu";
import SongRow from "../components/SongRow/SongRow";

function Layout() {
  const { data, generateScrobble, getNewSong, loading, isPaused, currentIndex, setCurrentIndex} = useLayout();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };
  const handleRefreshClick = () => {
    getNewSong()
    setOpen(false);
  };
  const handleListPlay = (i) => {
    setCurrentIndex(i);
    // handlePlayClick()
  };
 
 
  const pad = (value) =>{
    if (value < 10) {
      return "0" + value;
    } else {
      return value;
    }
  }
  const timeFormat = (date) => {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

const Dropdown = ({ open, trigger, menu }) => {
  return (
    <div className="dropdown">
      {trigger}
      {open ? (
        <div className="menu">
          {menu.map((menuItem, index) => (
            <div key={index} className="menu-item">{menuItem}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
  return (
    <div className="layout">
      <Player data={data} playerIndex={currentIndex} />
      <div className="list-header">
        <h4>Cover</h4>
        <h4>Title</h4>
        <h4>Date</h4>
        <h4>Time</h4>

      <Dropdown
      open={open}
      trigger={<button onClick={handleOpen}><Menu/></button>}
      menu={[
        <button className="newsongs" onClick={handleRefreshClick}>
        Refresh List
      </button>,

      <button className="addscrobble" onClick={generateScrobble}>
        New song
      </button>
      ]}
    />
        </div>
        <div className="list">
      <div className="playlist">
        {loading ? (
          <div className="loading"></div>
        ) : (
          <div className>
            {data
              ?.map((item, index) => (
                <SongRow
                  key={index}
                  song_name={item.song_name}
                  cover={item.image_url}
                  artists={item.artists.map((artist) => artist.name).join(", ")}
                  time={timeFormat(new Date(item.created_at))}
                  date={new Date(item.created_at).toLocaleDateString()}
                  paused={isPaused}
                  handleClick={()=>{handleListPlay(index)}}
                />
              ))
              .reverse()}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default Layout;
