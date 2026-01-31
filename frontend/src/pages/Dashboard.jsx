// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";

/* ================= CONFIG ================= */
const API_BASE = "https://watermeter-server.onrender.com";
const WS_BASE = "wss://watermeter-server.onrender.com";
const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

/* ================= SETTINGS (LOCAL STORAGE) ================= */
const SETTINGS_KEY = "smartwater_settings_v1";
const DEFAULT_SETTINGS = {
  language: "es", // es | en
  currency: "BOB", // BOB | USD
  monthlyPrice: MONTHS.reduce((acc, m) => ({ ...acc, [m]: 0.5 }), {}),
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      monthlyPrice: { ...DEFAULT_SETTINGS.monthlyPrice, ...(parsed.monthlyPrice || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

/* ================= HELPERS ================= */
function getParam(name, fallback) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || fallback;
}

function toDate(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d;
  const d2 = new Date(String(ts).replace(" ", "T"));
  if (!isNaN(d2.getTime())) return d2;
  return null;
}

/* ================= UI ATOMS ================= */
function GlassCard({ children, style }) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Toast({ show, title, desc, onClose }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        width: 380,
        maxWidth: "calc(100vw - 36px)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(10,12,16,0.92)",
        color: "#fff",
        padding: 14,
        backdropFilter: "blur(10px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
        zIndex: 9999,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,107,0,0.15)",
            border: "1px solid rgba(255,107,0,0.25)",
          }}
        >
          ✅
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 1100, marginBottom: 4 }}>{title}</div>
          <div style={{ opacity: 0.85, fontSize: 13, lineHeight: 1.35 }}>{desc}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: 0,
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
          }}
          title="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ================= UI (Sidebar / TopBar / Cards) ================= */
function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const Item = ({ id, label, icon }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 16,
          border: active ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
          background: active ? "rgba(255,255,255,0.10)" : "transparent",
          color: active ? "#fff" : "rgba(255,255,255,0.72)",
          cursor: "pointer",
          fontWeight: 1000,
          textAlign: "left",
        }}
      >
        <span style={{ width: 22, textAlign: "center" }}>{icon}</span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <aside
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        padding: 18,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.40)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            background: "rgba(37,99,235,0.22)",
            border: "1px solid rgba(37,99,235,0.25)",
            display: "grid",
            placeItems: "center",
            fontWeight: 1100,
          }}
        >
          💧
        </div>
        <div>
          <div style={{ fontWeight: 1100, fontSize: 15 }}>
            SmartWater <span style={{ color: "#3b82f6" }}>2026</span>
          </div>
          <div style={{ fontSize: 11, opacity: 0.65, letterSpacing: 1 }}>PANEL</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <Item id="dashboard" label="Tablero" icon="📊" />
        <Item id="analysis" label="Análisis" icon="📈" />
        <Item id="settings" label="Ajustes" icon="⚙️" />
      </div>

      <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, display: "grid", gap: 10 }}>
        <div
          style={{
            padding: 12,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              display: "grid",
              placeItems: "center",
              fontWeight: 1100,
            }}
          >
            JP
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 1100 }}>Usuario</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Sesión activa</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 16,
            border: "1px solid rgba(255,107,0,0.25)",
            background: "rgba(255,107,0,0.12)",
            color: "#fff",
            fontWeight: 1100,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function TopBarPeriod({ period, setPeriod, nowLabel, monthLabel }) {
  const Btn = ({ id, label }) => {
    const active = period === id;
    return (
      <button
        onClick={() => setPeriod(id)}
        style={{
          padding: "10px 16px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.10)",
          background: active ? "rgba(255,107,0,0.90)" : "rgba(255,255,255,0.06)",
          color: active ? "#fff" : "rgba(255,255,255,0.70)",
          fontWeight: 1000,
          cursor: "pointer",
          minWidth: 92,
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 14,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.10)",
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
          }}
        >
          💧
        </div>
        <div>
          <div style={{ fontWeight: 1100, fontSize: 14 }}>SmartWater 2026</div>
          <div style={{ opacity: 0.65, fontSize: 11 }}>RESUMEN</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 6,
          borderRadius: 999,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Btn id="week" label="Semana" />
        <Btn id="month" label="Mes" />
        <Btn id="year" label="Año" />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.06)",
            fontWeight: 900,
            fontSize: 12,
            opacity: 0.95,
            whiteSpace: "nowrap",
          }}
          title="Calendario en tiempo real"
        >
          📅 {monthLabel} · {nowLabel}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent = "#2563EB" }) {
  return (
    <div
      style={{
        borderRadius: 22,
        padding: 18,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          background: accent,
          opacity: 0.12,
          borderRadius: "50%",
          filter: "blur(10px)",
        }}
      />
      <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", opacity: 0.7, fontWeight: 900 }}>
        {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>{sub}</div>
    </div>
  );
}

/* ================= VIEWS ================= */
function DashboardView({ latest, recent, wsStatus, period, currentMonth }) {
  const currency = latest?.currency ?? "BOB";
  const price = Number(latest?.price_per_liter ?? 0);

  // Filtrar por periodo (best effort)
  const filtered = useMemo(() => {
    const now = new Date();
    return (recent || []).filter((r) => {
      const d = toDate(r.timestamp);
      if (!d) return false;

      if (period === "week") {
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (period === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return d.getFullYear() === now.getFullYear();
    });
  }, [recent, period]);

  const litersSum = filtered.reduce((a, r) => a + Number(r.liters_delta ?? 0), 0);
  const costSum = litersSum * price;

  const flowNow = Number(latest?.flow_lps ?? 0);
  const litersTotal = Number(latest?.liters_total ?? 0);
  const costTotal = Number(latest?.cost_total ?? (litersTotal * price));

  const chartData = useMemo(() => {
    if (period === "week") {
      const days = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
      const map = {};
      days.forEach((d) => (map[d] = 0));
      filtered.forEach((r) => {
        const d = toDate(r.timestamp);
        if (!d) return;
        map[days[d.getDay()]] += Number(r.liters_delta ?? 0);
      });
      return days.map((d) => ({ name: d, value: Number(map[d].toFixed(3)) }));
    }

    if (period === "month") {
      const map = {};
      filtered.forEach((r) => {
        const d = toDate(r.timestamp);
        if (!d) return;
        const day = d.getDate();
        map[day] = (map[day] || 0) + Number(r.liters_delta ?? 0);
      });
      const keys = Object.keys(map).map((k) => Number(k)).sort((a,b) => a-b);
      return keys.map((k) => ({ name: `D${k}`, value: Number(map[k].toFixed(3)) }));
    }

    const map = {};
    MONTHS.forEach((m) => (map[m] = 0));
    filtered.forEach((r) => {
      const d = toDate(r.timestamp);
      if (!d) return;
      map[MONTHS[d.getMonth()]] += Number(r.liters_delta ?? 0);
    });
    return MONTHS.map((m) => ({ name: m, value: Number(map[m].toFixed(3)) }));
  }, [filtered, period]);

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <MetricCard label="Litros (periodo)" value={`${litersSum.toFixed(3)} L`} sub={`Periodo: ${period}`} accent="#3b82f6" />
        <MetricCard label="Costo (periodo)" value={`${currency} ${costSum.toFixed(3)}`} sub={`Precio: ${price.toFixed(3)} ${currency}/L`} accent="#ff6b00" />
        <MetricCard label="Precio aplicado" value={`${price.toFixed(3)} ${currency}/L`} sub={`Mes actual: ${currentMonth}`} accent="#a855f7" />
        <MetricCard label="Total acumulado" value={`${currency} ${costTotal.toFixed(3)}`} sub={`${litersTotal.toFixed(3)} L`} accent="#22c55e" />
      </div>

      <GlassCard style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 1100, fontSize: 16 }}>
              Consumo ({period})
            </div>
            <div style={{ opacity: 0.75, fontSize: 12 }}>
              WS: <b style={{ color: wsStatus === "connected" ? "#22c55e" : "#f97316" }}>{wsStatus}</b> · Flujo: {flowNow.toFixed(3)} L/s
            </div>
          </div>
        </div>

        {/* ✅ Evita warning de recharts con minWidth/minHeight */}
        <div style={{ height: 320, minHeight: 320, width: "100%", minWidth: 0, marginTop: 10 }}>
          <ResponsiveContainer width="100%" height="100%">
            {period === "week" ? (
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16 }}
                  itemStyle={{ color: "#fff", fontSize: 14 }}
                />
                <Bar dataKey="value" radius={[12,12,12,12]} barSize={28}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={idx === 5 ? "#FF6B00" : "rgba(255,255,255,0.10)"} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.10)", strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16 }}
                  itemStyle={{ color: "#fff", fontSize: 14 }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fill="rgba(59,130,246,0.20)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

function SettingsView({ settings, setSettings, currentMonth, onSave }) {
  const currentPrice = Number(settings.monthlyPrice?.[currentMonth] ?? 0);

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 38, fontWeight: 1200 }}>Ajustes</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>
        Se aplica automáticamente el precio del mes actual: <b>{currentMonth}</b>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 14, marginTop: 18 }}>
        <GlassCard>
          <div style={{ fontWeight: 1100, marginBottom: 10 }}>Moneda</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { code: "BOB", label: "Bolivianos (Bs)" },
              { code: "USD", label: "USD ($)" },
            ].map((opt) => {
              const active = settings.currency === opt.code;
              return (
                <button
                  key={opt.code}
                  onClick={() => setSettings((s) => ({ ...s, currency: opt.code }))}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 16,
                    border: active ? "1px solid rgba(255,107,0,0.35)" : "1px solid rgba(255,255,255,0.10)",
                    background: active ? "rgba(255,107,0,0.12)" : "rgba(255,255,255,0.04)",
                    color: "#fff",
                    fontWeight: 1100,
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 18, fontWeight: 1100 }}>Precio del mes actual ({currentMonth})</div>
          <div style={{ opacity: 0.7, marginTop: 6 }}>Cambia este valor y verás el costo cambiar en vivo.</div>

          <input
            type="number"
            step="0.001"
            value={currentPrice}
            onChange={(e) => {
              const v = Number(e.target.value);
              setSettings((s) => ({
                ...s,
                monthlyPrice: { ...s.monthlyPrice, [currentMonth]: v },
              }));
            }}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
              color: "#fff",
              fontWeight: 1100,
              outline: "none",
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button
              onClick={onSave}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: "1px solid rgba(255,107,0,0.35)",
                background: "rgba(255,107,0,0.9)",
                color: "#fff",
                fontWeight: 1100,
                cursor: "pointer",
              }}
            >
              Guardar cambios
            </button>
          </div>

          <div style={{ opacity: 0.65, marginTop: 10, fontSize: 12 }}>
            Próximo paso: conectar estos settings con GET/PUT en tu backend.
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ fontWeight: 1100, marginBottom: 8 }}>Idioma (opcional)</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Por ahora lo dejamos listo para futuro. Tu app funciona sin esto.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* ================= PAGE EXPORT ================= */
export default function DashboardPage() {
  const nav = useNavigate();

  const meter = useMemo(() => getParam("meter", "MED-001A"), []);
  const pin = useMemo(() => getParam("pin", "1111"), []);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [period, setPeriod] = useState("month"); // week | month | year

  // reloj en vivo
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const currentMonth = MONTHS[now.getMonth()];
  const nowLabel = now.toLocaleString("es-BO", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // data
  const [latest, setLatest] = useState(null);
  const [recent, setRecent] = useState([]);
  const [err, setErr] = useState("");
  const [wsStatus, setWsStatus] = useState("connecting");

  // settings
  const [settings, setSettings] = useState(() => loadSettings());
  const [toast, setToast] = useState({ show: false, title: "", desc: "" });

  const latestRef = useRef(null);
  useEffect(() => { latestRef.current = latest; }, [latest]);

  // refs para NO reiniciar WS cuando cambian settings/mes
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const monthRef = useRef(currentMonth);
  useEffect(() => { monthRef.current = currentMonth; }, [currentMonth]);

  // initial load
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function initLoad() {
      try {
        setErr("");

        const [a, b] = await Promise.all([
          fetch(`${API_BASE}/api/meter/${encodeURIComponent(meter)}/latest?pin=${encodeURIComponent(pin)}`, {
            signal: controller.signal,
          }),
          fetch(`${API_BASE}/api/meter/${encodeURIComponent(meter)}/recent?pin=${encodeURIComponent(pin)}&limit=200`, {
            signal: controller.signal,
          }),
        ]);

        if (!a.ok) throw new Error(`latest HTTP ${a.status}`);
        if (!b.ok) throw new Error(`recent HTTP ${b.status}`);

        const latestJson = await a.json();
        const recentJson = await b.json();

        if (!alive) return;

        const currencyLocal = settings.currency === "USD" ? "USD" : "BOB";
        const priceLocal = Number(settings.monthlyPrice?.[currentMonth] ?? latestJson?.price_per_liter ?? 0);
        const litersTotal = Number(latestJson?.liters_total ?? 0);

        setLatest({
          ...latestJson,
          currency: currencyLocal,
          price_per_liter: priceLocal,
          cost_total: Number((litersTotal * priceLocal).toFixed(3)),
        });

        setRecent(recentJson.recent || []);
      } catch (e) {
        if (!alive) return;
        if (String(e).includes("AbortError")) return;
        setErr(String(e));
      }
    }

    initLoad();

    return () => {
      alive = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meter, pin]);

  // websocket reconnect (no depende de settings)
  useEffect(() => {
    let ws = null;
    let stopped = false;
    let retry = 0;
    let retryTimer = null;

    const connect = () => {
      if (stopped) return;

      setWsStatus(retry === 0 ? "connecting" : "reconnecting");
      setErr("");

      ws = new WebSocket(`${WS_BASE}/ws/meter/${encodeURIComponent(meter)}`);

      ws.onopen = () => {
        retry = 0;
        setWsStatus("connected");
      };

      ws.onclose = () => {
        setWsStatus("closed");
        if (stopped) return;

        const delay = Math.min(15000, 500 * 2 ** retry);
        retry += 1;
        retryTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        try { ws?.close(); } catch {}
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.status === "connected") return;

          const s = settingsRef.current;
          const monthNow = monthRef.current;

          const price = Number(
            s?.monthlyPrice?.[monthNow] ??
            latestRef.current?.price_per_liter ??
            0
          );

          const currencyLocal = s?.currency === "USD" ? "USD" : "BOB";

          setLatest((prev) => {
            const litersTotal = Number(data.liters_total ?? prev?.liters_total ?? 0);
            const costTotal = Number((litersTotal * price).toFixed(3));
            return {
              ...(prev || {}),
              meter_code: meter,
              currency: currencyLocal,
              price_per_liter: price,
              flow_lps: Number(data.flow_lps ?? prev?.flow_lps ?? 0),
              liters_total: litersTotal,
              timestamp: data.timestamp ?? prev?.timestamp ?? null,
              cost_total: costTotal,
            };
          });

          setRecent((prev) => {
            const litersDelta = Number(data.liters_delta ?? 0);
            const litersTotal = Number(data.liters_total ?? 0);

            const row = {
              timestamp: data.timestamp,
              flow_lps: Number(data.flow_lps ?? 0),
              liters_delta: litersDelta,
              liters_total: litersTotal,
              cost_delta: Number((litersDelta * price).toFixed(3)),
              cost_total: Number((litersTotal * price).toFixed(3)),
              currency: currencyLocal,
            };

            const prevArr = prev || [];
            if (row.timestamp && prevArr.length > 0 && prevArr[0]?.timestamp === row.timestamp) {
              return prevArr;
            }
            return [row, ...prevArr].slice(0, 500);
          });
        } catch {
          // ignore
        }
      };
    };

    connect();

    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      try { ws?.close(); } catch {}
    };
  }, [meter]);

  // reconcile each 60s
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/meter/${encodeURIComponent(meter)}/recent?pin=${encodeURIComponent(pin)}&limit=200`);
        if (!res.ok) return;
        const json = await res.json();
        setRecent(json.recent || []);
      } catch {}
    }, 60000);
    return () => clearInterval(t);
  }, [meter, pin]);

  // recalc costs when settings/month changes
  useEffect(() => {
    if (!latest) return;

    const currencyLocal = settings.currency === "USD" ? "USD" : "BOB";
    const priceLocal = Number(settings.monthlyPrice?.[currentMonth] ?? latest.price_per_liter ?? 0);

    setLatest((prev) => {
      if (!prev) return prev;
      const litersTotal = Number(prev.liters_total ?? 0);
      return {
        ...prev,
        currency: currencyLocal,
        price_per_liter: priceLocal,
        cost_total: Number((litersTotal * priceLocal).toFixed(3)),
      };
    });

    setRecent((prev) =>
      (prev || []).map((r) => {
        const litersDelta = Number(r.liters_delta ?? 0);
        const litersTotal = Number(r.liters_total ?? 0);
        return {
          ...r,
          currency: currencyLocal,
          cost_delta: Number((litersDelta * priceLocal).toFixed(3)),
          cost_total: Number((litersTotal * priceLocal).toFixed(3)),
        };
      })
    );
  }, [settings, currentMonth]); // <- key

  function handleSaveSettings() {
    saveSettings(settings);
    setToast({
      show: true,
      title: "Cambios guardados",
      desc: `Mes actual: ${currentMonth} • Precio: ${Number(settings.monthlyPrice?.[currentMonth] ?? 0).toFixed(3)} ${settings.currency}/L`,
    });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  }

  function handleLogout() {
    // limpia sesión (token/role)
    localStorage.removeItem("sw_token");
    localStorage.removeItem("sw_role");
    // opcional: también el user de smartwater
    localStorage.removeItem("smartwater_user");
    nav("/login", { replace: true });
  }

  return (
    <div style={{ background: "#0b1220", color: "#e5e7eb" }}>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        <main style={{ padding: 22 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <TopBarPeriod period={period} setPeriod={setPeriod} nowLabel={nowLabel} monthLabel={currentMonth} />

            {err && (
              <div style={{ background: "#7f1d1d", padding: 12, borderRadius: 12, marginBottom: 14 }}>
                Error: {err}
              </div>
            )}

            {activeTab === "dashboard" && (
              <DashboardView
                latest={latest}
                recent={recent}
                wsStatus={wsStatus}
                period={period}
                currentMonth={currentMonth}
              />
            )}

            {activeTab === "analysis" && (
              <div style={{ marginTop: 18, opacity: 0.85 }}>
                Aquí luego colocamos el “Análisis Premium” (diario/semanal/mensual) como página completa.
              </div>
            )}

            {activeTab === "settings" && (
              <SettingsView
                settings={settings}
                setSettings={setSettings}
                currentMonth={currentMonth}
                onSave={handleSaveSettings}
              />
            )}
          </div>
        </main>
      </div>

      <Toast
        show={toast.show}
        title={toast.title}
        desc={toast.desc}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />
    </div>
  );
}
