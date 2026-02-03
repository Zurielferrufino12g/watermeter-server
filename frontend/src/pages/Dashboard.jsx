import { useEffect, useRef } from "react";

const WS_URL = "wss://watermeter-server.onrender.com/ws/meter/MED-001A";

export default function Dashboard() {
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket conectado");
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("📩 WS data:", data);
    };

    ws.onerror = (e) => {
      console.error("❌ WS error", e);
    };

    ws.onclose = () => {
      console.warn("⚠️ WS cerrado");
    };

    return () => {
      console.log("🔌 Cerrando WS");
      ws.close();
    };
  }, []); // 👈 importante: SOLO una vez

  return <div>Dashboard</div>;
}