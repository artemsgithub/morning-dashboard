import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Track user inactivity. Returns `idle` which flips to true after
 * `timeoutMs` without any pointer/touch/keyboard activity.
 * Call `reset()` to manually kick it back to active.
 */
export default function useInactivity(timeoutMs = 5 * 60 * 1000) {
  const [idle, setIdle] = useState(false);
  const lastActivity = useRef(Date.now());

  const reset = useCallback(() => {
    lastActivity.current = Date.now();
    setIdle(false);
  }, []);

  useEffect(() => {
    const events = ["mousedown", "touchstart", "keydown", "pointerdown"];
    const onActivity = () => reset();
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, onActivity));
  }, [reset]);

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastActivity.current > timeoutMs) {
        setIdle(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [timeoutMs]);

  return { idle, reset };
}
