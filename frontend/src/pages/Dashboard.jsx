// frontend/src/pages/Dashboard.jsx
import { useEffect, useRef, useState } from "react";

const WS_URL = "wss://watermeter-fapi.onrender.com/ws/meter/MED-001A";

export default function Dashboard() {
  const wsRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [flow, setFlow] = useState(0);
  const [liters, setLiters] = useState(0);
  const [lastMsg, setLastMsg] = useState(null);

  useEffect(() => {
    console.log("🚀 Montando Dashboard");

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket conectado");
      setConnected(true);
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        // Guardar el último mensaje para verlo en pantalla
        setLastMsg(data);

        // Ignorar ping (solo latido)
        if (data.type === "ping") return;

        console.log("📩 WS data:", data);

        // 👇 Ajusta estos campos según lo que realmente mande tu backend
        if (typeof data.flow_lps === "number") setFlow(data.flow_lps);
        if (typeof data.total_liters === "number") setLiters(data.total_liters);

      } catch (err) {
        console.error("❌ Error parseando WS", err, e.data);
      }
    };

    ws.onerror = (e) => {
      console.error("❌ WS error", e);
    };

    ws.onclose = () => {
      console.warn("⚠️ WS cerrado");
      setConnected(false);
    };

    return () => {
      console.log("🔌 Cerrando WS");
      ws.close();
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Water Meter Dashboard</h1>

      <p>
        Estado: {connected ? "🟢 Conectado" : "🔴 Desconectado"}
      </p>

      <hr />

      <p><b>Flujo actual:</b> {flow} L/s</p>
      <p><b>Litros acumulados:</b> {liters} L</p>

      <hr />

      <pre style={{ background: "#111", color: "#0f0", padding: 10 }}>
        {JSON.stringify(lastMsg, null, 2)}
      </pre>
    </div>
  );
}