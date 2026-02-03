import { useEffect, useRef, useState } from "react";

const WS_URL = "wss://watermeter-fapi.onrender.com/ws/meter/MED-001A";

// 👇 CAMBIA ESTA URL AL ENDPOINT REAL QUE DEVUELVE ESTADO
// Ejemplos típicos (elige el que exista en tu API):
// const STATUS_URL = "https://watermeter-fapi.onrender.com/api/meter/MED-001A/status";
// const STATUS_URL = "https://watermeter-fapi.onrender.com/meter/MED-001A/status";
// const STATUS_URL = "https://watermeter-fapi.onrender.com/api/meter/MED-001A/latest";
const STATUS_URL = "https://watermeter-fapi.onrender.com/api/meter/MED-001A/latest";

export default function Dashboard() {
  const wsRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [flow, setFlow] = useState(0);
  const [liters, setLiters] = useState(0);
  const [lastMsg, setLastMsg] = useState(null);
  const [lastHttp, setLastHttp] = useState(null);

  async function fetchStatus() {
    try {
      const r = await fetch(STATUS_URL);
      const j = await r.json();
      setLastHttp(j);

      // Ajusta campos según lo que devuelva tu API:
      if (typeof j.flow_lps === "number") setFlow(j.flow_lps);
      if (typeof j.total_liters === "number") setLiters(j.total_liters);

      // Si tu API usa otros nombres, prueba estos:
      if (typeof j.flow === "number") setFlow(j.flow);
      if (typeof j.total === "number") setLiters(j.total);

    } catch (e) {
      console.error("❌ Error fetch status", e);
    }
  }

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
        setLastMsg(data);

        // Cuando llega ping, pedimos el estado por HTTP
        if (data.type === "ping") {
          fetchStatus();
          return;
        }

        console.log("📩 WS data:", data);

        // Si el WS algún día manda datos, también los capturamos:
        if (typeof data.flow_lps === "number") setFlow(data.flow_lps);
        if (typeof data.total_liters === "number") setLiters(data.total_liters);
        if (typeof data.flow === "number") setFlow(data.flow);
        if (typeof data.total === "number") setLiters(data.total);

      } catch (err) {
        console.error("❌ Error parseando WS", err, e.data);
      }
    };

    ws.onerror = (e) => console.error("❌ WS error", e);

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

      <p>Estado: {connected ? "🟢 Conectado" : "🔴 Desconectado"}</p>

      <hr />

      <p><b>Flujo actual:</b> {flow} L/s</p>
      <p><b>Litros acumulados:</b> {liters} L</p>

      <hr />

      <h3>Último WS:</h3>
      <pre style={{ background: "#111", color: "#0f0", padding: 10 }}>
        {JSON.stringify(lastMsg, null, 2)}
      </pre>

      <h3>Último HTTP status:</h3>
      <pre style={{ background: "#111", color: "#0ff", padding: 10 }}>
        {JSON.stringify(lastHttp, null, 2)}
      </pre>
    </div>
  );
}