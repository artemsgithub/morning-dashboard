import { useEffect, useRef } from "react";

export default function useWakeLock() {
  const wakeLock = useRef(null);

  async function request() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // Wake Lock denied or not supported — silent fail is fine
    }
  }

  useEffect(() => {
    request();

    // Re-acquire when tab becomes visible again (e.g. after switching apps)
    function onVisibility() {
      if (document.visibilityState === "visible") request();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      wakeLock.current?.release();
    };
  }, []);
}
