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
        setLastMsg(data);

        // Ejemplo de mensajes esperados
        if (data.type === "meter") {
          setFlow(data.flow ?? 0);
          setLiters(data.liters ?? 0);
        }

        if (data.type === "ping") {
          console.log("💓 ping");
        }
      } catch (err) {
        console.error("❌ Error parseando WS", err);
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
  }, []); // IMPORTANTE: solo una vez

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Water Meter Dashboard</h1>

      <p>
        Estado:
        {connected ? " 🟢 Conectado" : " 🔴 Desconectado"}
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
