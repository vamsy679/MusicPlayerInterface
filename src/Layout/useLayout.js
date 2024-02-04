import { useState, useEffect } from "react";
import ScrobbleApi from "../api/scrobble-api";

const useLayout = () => {
  const [data, setData] = useState();
  const [scrobblelist, setSrobble] = useState();
  const [currentIndex, setCurrentIndex] = useState();
  const [currentsong, setCurrentSong] = useState({
    song_name: "",
    artist: "",
    img: "",
  });
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (data === undefined) {
      display(DEFAULT_ZONE_ID);
    }

    if (currentIndex !== undefined) {
      setCurrentSong({
        song_name: data[currentIndex].song_name,
        artist: data[currentIndex].artists
          .map((artist) => artist.name)
          .join(", "),
        img: data[currentIndex].image_url,
      });
    }
  }, []);

 
  let apiInstance;
  // Zone id for "Soundtrack HQ - Kitchen"
  const DEFAULT_ZONE_ID =
    "U291bmRab25lLCwxa21ubGNxZ3BvZy9Mb2NhdGlvbiwsMWp2bnk3aTdoMWMvQWNjb3VudCwsMW5kbWR6bmF5Z3cv";

  function generateScrobble() {
    addScrobble(ScrobbleApi.mockScrobble());
  }
  const display = (zoneId) => {
    zoneId = zoneId.replace(/^[ #]+|\s+$/, "");
    setLoading(true);

    if (apiInstance) {
      apiInstance.unsubscribe();

      // Clear history
      const rows = document.getElementsByClassName("played__row");
      for (let i = rows.length - 1; i >= 0; --i) {
        rows[i].remove();
      }
    }
    apiInstance = new ScrobbleApi(zoneId);

    apiInstance.fetchHistory().then((scrobbles) => {
      setData(scrobbles);
      setLoading(false);
      scrobbles.map(addScrobble);
      apiInstance.subscribe(addScrobble);
    });
  };
  // Prepends the provided scrobble to the list
  function addScrobble(scrobble) {
    [scrobble].forEach((kv, i) => {
      setSrobble(kv);
    });
    if(data){
      data.shift();
      data.push(scrobblelist);
    }
  }
  const getNewSong = () => {
    display(DEFAULT_ZONE_ID);
  };
  const handlePlayClick = () =>{
    setIsPaused(prev => !prev)
  }

  return {
    data,
    scrobblelist,
    currentIndex,
    currentsong,
    loading,
    index,
    isPaused,
    setIsPaused,
    setIndex,
    generateScrobble,
    setData,
    getNewSong,
    handlePlayClick,
    setCurrentIndex
    
  };
};

export default useLayout;
