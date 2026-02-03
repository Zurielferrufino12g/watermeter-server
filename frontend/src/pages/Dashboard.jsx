// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/login";
import DashboardPage from "./pages/Dashboard";
import AdminPage from "./pages/Admin";

/* ================= AUTH HELPERS ================= */
function getToken() {
  return localStorage.getItem("sw_token") || sessionStorage.getItem("sw_token");
}

function getRole() {
  return localStorage.getItem("sw_role") || sessionStorage.getItem("sw_role");
}

/* ================= GUARDS ================= */
function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const token = getToken();
  const role = getRole();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

/* ================= ROUTES ================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />

        {/* Rutas por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

frontend/src/pages/Dashboard.jsx
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

/* ================= CONFIG =================
    OJO: NO uses links tipo [texto](url) dentro de strings.
    Deben ser URLs planas, porque WebSocket() y fetch() no entienden Markdown.
*/
const API_BASE = "https://watermeter-server.onrender.com";
const WS_BASE  = "wss://watermeter-server.onrender.com";

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

function clampNum(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
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
            👤
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
        marginBottom: 18,
        flexWrap: "wrap",
      }}
    >
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
 8       {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>{value}</div>
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>{sub}</div>
    </div>
  );
}

/* ================= VIEWS ================= */
function DashboardView({ latest, recent, wsStatus, period, currentMonth }) {
  const currency = latest?.currency ?? "BOB";
  const price = clampNum(latest?.price_per_liter, 0);

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

  const litersSum = filtered.reduce((a, r) => a + clampNum(r.liters_delta, 0), 0);
  const costSum = litersSum * price;

  const flowNow = clampNum(latest?.flow_lps, 0);
  const litersTotal = clampNum(latest?.liters_total, 0);
  const costTotal = clampNum(latest?.cost_total, litersTotal * price);
8
  const chartData = useMemo(() => {
    if (period === "week") {
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const map = {};
      days.forEach((d) => (map[d] = 0));

      filtered.forEach((r) => {
        const dd = toDate(r.timestamp);
        if (!dd) return;
        map[days[dd.getDay()]] += clampNum(r.liters_delta, 0);
      });

      return days.map((d) => ({ name: d, value: Number(map[d].toFixed(3)) }));
    }

    if (period === "month") {
      const map = {};
      filtered.forEach((r) => {
        const dd = toDate(r.timestamp);
        if (!dd) return;
        const day = dd.getDate();
        map[day] = (map[day] || 0) + clampNum(r.liters_delta, 0);
      });

      const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
      return keys.map((k) => ({ name: `D${k}`, value: Number(map[k].toFixed(3)) }));
    }

    const map = {};
    MONTHS.forEach((m) => (map[m] = 0));
    filtered.forEach((r) => {
      const dd = toDate(r.timestamp);
      if (!dd) return;
      map[MONTHS[dd.getMonth()]] += clampNum(r.liters_delta, 0);
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
            <div style={{ fontWeight: 1100, fontSize: 16 }}>Consumo ({period})</div>
            <div style={{ opacity: 0.75, fontSize: 12 }}>
              WS:{" "}
              <b style={{ color: wsStatus === "connected" ? "#22c55e" : "#f97316" }}>
                {wsStatus}
              </b>{" "}
              · Flujo: {flowNow.toFixed(3)} L/s
            </div>
          </div>
        </div>

        <div style={{ height: 320, minHeight: 320, width: "100%", minWidth: 0, marginTop: 10 }}>
          <ResponsiveContainer width="100%" height="100%">
            {period === "week" ? (
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill="rgba(59,130,246,0.85)" />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{
                    backgroundColor: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="rgba(255,107,0,0.9)" fill="rgba(255,107,0,0.25)" strokeWidth={2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

function AnalysisView({ recent }) {
  return (
    <div style={{ marginTop: 10 }}>
      <GlassCard>
        <div style={{ fontWeight: 1100, fontSize: 16, marginBottom: 8 }}>Últimos eventos (debug)</div>
        <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 12 }}>
        Muestra los últimos registros del backend para ver si llegan litros_delta y flow_lps.
        </div>
        <pre style={{ background: "#0b0f14", color: "#9ae6b4", padding: 14, borderRadius: 14, overflow: "auto" }}>
{JSON.stringify(recent?.slice(0, 30) || [], null, 2)}
        </pre>
      </GlassCard>
    </div>
  );
}

function SettingsView({ settings, setSettings, monthLabel }) {
  const [local, setLocal] = useState(settings);

  useEffect(() => setLocal(settings), [settings]);

  function updateMonthPrice(month, val) {
    setLocal((prev) => ({
      ...prev,
      monthlyPrice: { ...prev.monthlyPrice, [month]: clampNum(val, 0) },
    }));
  }

  function save() {
    setSettings(local);
    saveSettings(local);
  }

  return (
    <div style={{ marginTop: 10, display: "grid", gap: 14 }}>
      <GlassCard>
        <div style={{ fontWeight: 1100, fontSize: 16, marginBottom: 10 }}>Ajustes</div>

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 900, opacity: 0.8 }}>Moneda</span>
            <select
              value={local.currency}
              onChange={(e) => setLocal((p) => ({ ...p, currency: e.target.value }))}
              style={{ padding: 10, borderRadius: 12 }}
            >
              <option value="BOB">BOB</option>
              <option value="USD">USD</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 900, opacity: 0.8 }}>
              Precio por litro del mes ({monthLabel})
            </span>
            <input
              type="number"
              step="0.001"
              value={local.monthlyPrice[monthLabel] ?? 0}
              onChange={(e) => updateMonthPrice(monthLabel, e.target.value)}
              style={{ padding: 10, borderRadius: 12 }}
            />
          </label>

          <button
            onClick={save}
            style={{
              marginTop: 6,
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(37,99,235,0.30)",
              background: "rgba(37,99,235,0.20)",
              color: "#fff",
              fontWeight: 1100,
              cursor: "pointer",
            }}
          >
            Guardar ajustes
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

/* ================= PAGE ================= */
export default function Dashboard() {
  const navigate = useNavigate();

  // meter code configurable: /dashboard?meter=MED-001A
  const meterCode = getParam("meter", "MED-001A");

  // UI state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [period, setPeriod] = useState("week");
  const [settings, setSettings] = useState(loadSettings());

  // data state
  const [latest, setLatest] = useState(null);
  const [recent, setRecent] = useState([]);
  const [wsStatus, setWsStatus] = useState("disconnected");

  // toast
  const [toast, setToast] = useState({ show: false, title: "", desc: "" });

  // ws ref
  const wsRef = useRef(null);

  const now = new Date();
  const nowLabel = now.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const monthLabel = MONTHS[now.getMonth()];

  // price_per_liter comes from settings (month-based)
  const priceForMonth = clampNum(settings.monthlyPrice[monthLabel], 0);

  /* -------- REST: fetch latest + recent -------- */
  async function fetchLatest() {
    const url = `${API_BASE}/api/meter/${encodeURIComponent(meterCode)}/latest`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error(`latest ${res.status}`);
    const data = await res.json();

    // asegura campos mínimos para UI
    return {
      ...data,
      currency: settings.currency,
      price_per_liter: priceForMonth,
      cost_total: clampNum(data?.liters_total, 0) * priceForMonth,
    };
  }

  async function fetchRecent() {
    // si no existe en tu backend, puedes borrar esto sin problema
    const url = `${API_BASE}/api/meter/${encodeURIComponent(meterCode)}/recent?limit=500`;
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  /* -------- WS connect -------- */
  function connectWS() {
    const wsUrl = `${WS_BASE}/ws/meter/${encodeURIComponent(meterCode)}`;

    // cerrar si ya había uno
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("connected");
      setToast({ show: true, title: "WebSocket conectado", desc: `Medidor: ${meterCode}` });
      console.log("✅ WebSocket conectado:", wsUrl);
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        // Ignora ping
        if (data?.type === "ping") return;

        // guarda reciente “last message” dentro de recent (modo debug)
        setRecent((prev) => [data, ...prev].slice(0, 500));

        // si viene tipo connected o tiene métricas, actualiza “latest”
        if (data?.type === "connected") {
          setLatest((prev) => ({
            ...(prev || {}),
            ...data,
            currency: settings.currency,
            price_per_liter: priceForMonth,
          }));
          return;
        }

        // normal: payload con flow_lps / liters_total / liters_delta
        const nextLatest = {
          ...(latest || {}),
          ...data,
          currency: settings.currency,
          price_per_liter: priceForMonth,
        };

        // recalcula costo total si hay litros_total
        const litersTotal = clampNum(nextLatest.liters_total, clampNum(latest?.liters_total, 0));
        nextLatest.cost_total = litersTotal * priceForMonth;

        setLatest(nextLatest);
      } catch (err) {
        console.error("❌ Error parseando WS:", err);
      }
    };

    ws.onerror = (e) => {
      console.error("❌ WS error", e);
    };

    ws.onclose = () => {
      console.warn("⚠️ WS cerrado");
      setWsStatus("disconnected");
    };
  }

  /* -------- init + polling backup -------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [l, r] = await Promise.all([fetchLatest(), fetchRecent()]);
        if (cancelled) return;
        setLatest(l);
        setRecent(r);
      } catch (e) {
        console.warn("⚠️ Error inicial:", e);
      }
    })();

    connectWS();

    // polling cada 15s como respaldo
    const t = setInterval(async () => {
      try {
        const l = await fetchLatest();
        if (!cancelled) setLatest(l);
      } catch {}
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(t);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meterCode]);

  // cuando cambias settings/price, refresca latest para recalcular costo
  useEffect(() => {
    if (!latest) return;
    setLatest((prev) => {
      const litersTotal = clampNum(prev?.liters_total, 0);
      return {
        ...prev,
        currency: settings.currency,
        price_per_liter: priceForMonth,
        cost_total: litersTotal * priceForMonth,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.currency, priceForMonth]);

  function onLogout() {
    localStorage.removeItem("sw_token");
    localStorage.removeItem("sw_role");
    sessionStorage.removeItem("sw_token");
    sessionStorage.removeItem("sw_role");
    navigate("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at 20% 0%, #0b1b3a 0%, #05070b 55%)", color: "#fff" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr" }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

        <main style={{ padding: 18 }}>
          <TopBarPeriod period={period} setPeriod={setPeriod} nowLabel={nowLabel} monthLabel={monthLabel} />

          {activeTab === "dashboard" && (
            <DashboardView
              latest={latest}
              recent={recent}
              wsStatus={wsStatus}
              period={period}
              currentMonth={monthLabel}
            />
          )}

          {activeTab === "analysis" && <AnalysisView recent={recent} />}

          {activeTab === "settings" && (
            <SettingsView settings={settings} setSettings={setSettings} monthLabel={monthLabel} />
          )}
        </main>
      </div>

      <Toast
        show={toast.show}
        title={toast.title}
        desc={toast.desc}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />
    </div>
  );
}