import {useRef} from "react";
import {useQuery} from "@tanstack/react-query";
import {client} from "./api";
import "./index.css";

type WeatherParams = {
  country?: string;
  lat?: string;
  long?: string;
};

function getWeatherParamsFromUrl(): WeatherParams {
  const params = new URLSearchParams(window.location.search);
  const lat = params.get("lat");
  const long = params.get("long");

  if (lat && long) {
    return {lat, long};
  }

  return {country: params.get("country") ?? "GB"};
}

async function fetchWeather(params: WeatherParams) {
  const res = await client.api.weather.$get({
    query: params,
  });
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export function App() {
  const weatherParams = getWeatherParamsFromUrl();
  const videoRef = useRef<HTMLVideoElement>(null);

  const {data, isLoading, refetch} = useQuery({
    queryKey: ["weather", weatherParams],
    queryFn: () => fetchWeather(weatherParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleVideoEnded = async () => {
    const result = await refetch();
    const newVideoUrl =
      result.data && "videoUrl" in result.data ? result.data.videoUrl : null;

    if (videoRef.current && newVideoUrl) {
      // Reset and play - works whether URL changed or stayed the same
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked by browser policy
      });
    }
  };

  return (
    <div className="video-container">
      {isLoading && <div className="loading">Loading weather...</div>}

      {data && "videoUrl" in data && (
        <video
          ref={videoRef}
          className="fullscreen-video"
          src={data.videoUrl}
          autoPlay
          playsInline
          controls
          onEnded={handleVideoEnded}
        />
      )}
    </div>
  );
}

export default App;
