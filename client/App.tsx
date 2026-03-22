import {useRef, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {client} from "./api";
import "./index.css";

function getCountryFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("country") ?? "GB";
}

async function fetchWeather(countryCode: string) {
  const res = await client.api.weather.$get({
    query: {country: countryCode},
  });
  if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
  return res.json();
}

export function App() {
  const country = getCountryFromUrl();
  const videoRef = useRef<HTMLVideoElement>(null);

  const {data, isLoading, refetch} = useQuery({
    queryKey: ["weather", country],
    queryFn: () => fetchWeather(country),
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
          onEnded={handleVideoEnded}
        />
      )}
    </div>
  );
}

export default App;
