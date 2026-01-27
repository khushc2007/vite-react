import { useEffect, useState } from "react";

export function useBackendConnectivity(url: string) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(url, { method: "GET" });
        setConnected(res.ok);
      } catch {
        setConnected(false);
      }
    };

    check(); // initial check
    const id = setInterval(check, 5000); // every 5s

    return () => clearInterval(id);
  }, [url]);

  return connected;
}
