import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://watermeter-server.onrender.com";

function getParam(name, fallback) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || fallback;
}

export default function App() {
  const meter = useMemo(() => getParam("meter", "MED-001A"), []);
  const pin = useMemo(() => getParam("pin", "1111"), []);

  const [latest, setLatest] = useState(null);
  const [recent, setRecent] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const [a, b] = await Promise.all([
        fetch(`${API_BASE}/api/meter/${encodeURIComponent(meter)}/latest?pin=${encodeURIComponent(pin)}`),
        fetch(`${API_BASE}/api/meter/${encodeURIComponent(meter)}/recent?pin=${encodeURIComponent(pin)}&limit=10`)
      ]);

      if (!a.ok) throw new Error(`latest HTTP ${a.status}`);
      if (!b.ok) throw new Error(`recent HTTP ${b.status}`);

      const latestJson = await a.json();
      const recentJson = await b.json();

      setLatest(latestJson);
      setRecent(recentJson.recent || []);
    } catch (e) {
      setErr(String(e));
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 1000); // cada 2s
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = (title, value, unit) => (
    <div style={{
      padding: 18, borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)",
      background: "white", boxShadow: "0 8px 30px rgba(0,0,0,0.06)"
    }}>
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>
        {value} <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.6 }}>{unit}</span>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#e5e7eb", padding: 22 }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: 18
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>Medidor: {meter}</div>
            {latest && (
              <div style={{ opacity: 0.8, marginTop: 4 }}>
                Categoría: <b>{latest.category}</b> — Dirección: {latest.barrio}, {latest.calle}, {latest.numero}
              </div>
            )}
          </div>

          <div style={{ alignSelf: "center", opacity: 0.8 }}>
            {latest?.timestamp ? `Última actualización: ${latest.timestamp}` : "Sin lecturas aún"}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "18px auto 0" }}>
        {err && (
          <div style={{ background: "#7f1d1d", padding: 12, borderRadius: 12 }}>
            Error: {err}
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
          marginTop: 14
        }}>
          {card("Flujo actual", latest ? Number(latest.flow_lps).toFixed(3) : "0.000", "L/s")}
          {card("Litros acumulados", latest ? Number(latest.liters_total).toFixed(3) : "0.000", "L")}
          {card("Estado", "Conectado", "OK")}
        </div>

        <div style={{
          marginTop: 18,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: 16
        }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Lecturas recientes</div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
              <thead>
                <tr style={{ textAlign: "left", opacity: 0.8 }}>
                  <th style={{ padding: "10px 8px" }}>Fecha/Hora</th>
                  <th style={{ padding: "10px 8px" }}>Flujo (L/s)</th>
                  <th style={{ padding: "10px 8px" }}>Litros Delta</th>
                  <th style={{ padding: "10px 8px" }}>Litros Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 10, opacity: 0.7 }}>Sin lecturas aún…</td>
                  </tr>
                )}
                {recent.map((r, i) => (
                  <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: "10px 8px" }}>{r.timestamp}</td>
                    <td style={{ padding: "10px 8px" }}>{Number(r.flow_lps).toFixed(3)}</td>
                    <td style={{ padding: "10px 8px" }}>{Number(r.liters_delta).toFixed(3)}</td>
                    <td style={{ padding: "10px 8px" }}>{Number(r.liters_total).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 10, opacity: 0.75 }}>
            Prueba: <code>?meter=MED-001A&pin=1111</code>
          </div>
        </div>
      </div>
    </div>
  );
}