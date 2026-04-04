import { useState, useEffect } from "react";

function ClockHeader() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="clock-header">
      <h1 className="clock-time">{time}</h1>
      <p className="clock-date">{date}</p>
    </header>
  );
}

export default ClockHeader;
