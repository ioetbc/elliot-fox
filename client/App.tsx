import {useQuery} from "@tanstack/react-query";
import {useRef, useState, useCallback} from "react";
import {client} from "./api";
import {useVideoDoubleBuffer} from "./hooks/useVideoDoubleBuffer";
import "./index.css";

type WeatherParams = {
  location?: string;
};

function getWeatherParamsFromUrl(): WeatherParams {
  const params = new URLSearchParams(window.location.search);
  return {location: params.get("location") ?? "london"};
}

async function fetchWeather(params: WeatherParams) {
  const res = await client.api.weather.$get({query: params});
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export function App() {
  const weatherParams = getWeatherParamsFromUrl();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const {data, isLoading, refetch} = useQuery({
    queryKey: ["weather", weatherParams],
    queryFn: () => fetchWeather(weatherParams),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const getNextVideoUrl = async () => {
    const result = await refetch();
    return result.data && "videoUrl" in result.data ? result.data.videoUrl : null;
  };

  const initialVideoUrl = data && "videoUrl" in data ? data.videoUrl : undefined;

  const {videoARef, videoBRef, handleTimeUpdate, handleVideoEnded, play, pause} =
    useVideoDoubleBuffer(initialVideoUrl, getNextVideoUrl);

  const handleStart = useCallback(() => {
    play();
    setHasStarted(true);
  }, [play]);

  const togglePlayPause = useCallback(() => {
    if (isPaused) {
      play();
      setIsPaused(false);
    } else {
      pause();
      setIsPaused(true);
    }
  }, [isPaused, play, pause]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  if (isLoading || !data || !("videoUrl" in data)) {
    return (
      <div className="video-container">
        {isLoading && <div className="loading">Loading weather...</div>}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="video-container">
      <video
        ref={videoARef}
        className="fullscreen-video"
        style={{opacity: 0, zIndex: 0}}
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
      />
      <video
        ref={videoBRef}
        className="fullscreen-video"
        style={{opacity: 0, zIndex: 0}}
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
      />
      {!hasStarted && (
        <button className="play-overlay" onClick={handleStart}>
          ▶
        </button>
      )}
      {hasStarted && (
        <div className="video-controls">
          <button className="control-btn" onClick={togglePlayPause}>
            {isPaused ? "▶" : "⏸"}
          </button>
          <button className="control-btn" onClick={toggleFullscreen}>
            {isFullscreen ? "⤡" : "⤢"}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
