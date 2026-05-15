import {useRef, useEffect} from "react";

const PREFETCH_THRESHOLD = 0.4;

export function useVideoDoubleBuffer(
  initialVideoUrl: string | undefined,
  getNextVideoUrl: () => Promise<string | null>,
) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const activeSlot = useRef<"a" | "b">("a");
  const prefetchInFlightRef = useRef(false);
  const prefetchDoneRef = useRef(false);

  const getActive = () =>
    activeSlot.current === "a" ? videoARef.current : videoBRef.current;

  const getInactive = () =>
    activeSlot.current === "a" ? videoBRef.current : videoARef.current;

  const show = (video: HTMLVideoElement) => {
    video.style.opacity = "1";
    video.style.zIndex = "1";
  };

  const hide = (video: HTMLVideoElement) => {
    video.style.opacity = "0";
    video.style.zIndex = "0";
  };

  const swap = () => {
    const active = getActive();
    const inactive = getInactive();
    if (!inactive) return;

    inactive.play().catch(() => {});
    show(inactive);
    if (active) hide(active);

    activeSlot.current = activeSlot.current === "a" ? "b" : "a";
    prefetchDoneRef.current = false;
    prefetchInFlightRef.current = false;
  };

  const loadIntoInactive = (url: string) => {
    const inactive = getInactive();
    if (!inactive) return;
    inactive.src = url;
    inactive.load();
  };

  const handleTimeUpdate = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video !== getActive()) return;
    if (prefetchDoneRef.current || prefetchInFlightRef.current) return;
    if (!video.duration) return;

    const remaining = (video.duration - video.currentTime) / video.duration;
    if (remaining > PREFETCH_THRESHOLD) return;

    prefetchInFlightRef.current = true;
    const url = await getNextVideoUrl();
    if (url) loadIntoInactive(url);
    prefetchDoneRef.current = true;
    prefetchInFlightRef.current = false;
  };

  const handleVideoEnded = async (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (e.currentTarget !== getActive()) return;
    const inactive = getInactive();
    if (!inactive) return;

    if (inactive.src) {
      if (inactive.readyState >= 3) {
        swap();
      } else {
        inactive.addEventListener("canplay", swap, {once: true});
      }
      return;
    }

    const url = await getNextVideoUrl();
    if (!url) return;
    inactive.src = url;
    inactive.load();
    inactive.addEventListener("canplay", swap, {once: true});
  };

  useEffect(() => {
    const videoA = videoARef.current;
    if (!initialVideoUrl || !videoA || videoA.src) return;
    videoA.src = initialVideoUrl;
    videoA.load();
    videoA.play().catch(() => {});
    show(videoA);
  }, [initialVideoUrl]);

  return {videoARef, videoBRef, handleTimeUpdate, handleVideoEnded};
}
