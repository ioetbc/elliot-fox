import {useQuery} from "@tanstack/react-query";
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

  const {videoARef, videoBRef, handleTimeUpdate, handleVideoEnded} =
    useVideoDoubleBuffer(initialVideoUrl, getNextVideoUrl);

  if (isLoading || !data || !("videoUrl" in data)) {
    return (
      <div className="video-container">
        {isLoading && <div className="loading">Loading weather...</div>}
      </div>
    );
  }

  return (
    <div className="video-container">
      <video
        ref={videoARef}
        className="fullscreen-video"
        style={{opacity: 0, zIndex: 0}}
        playsInline
        preload="auto"
        controls
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
      />
      <video
        ref={videoBRef}
        className="fullscreen-video"
        style={{opacity: 0, zIndex: 0}}
        playsInline
        preload="auto"
        controls
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
      />
    </div>
  );
}

export default App;
