// frontend/src/pages/Admin.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../auth/firebase";

const MONTHS = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];

function Glass({ children, style }) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Chip({ label, tone = "gray" }) {
  const map = {
    green: { bg: "rgba(34,197,94,0.15)", bd: "rgba(34,197,94,0.25)", tx: "#22c55e" },
    orange:{ bg: "rgba(255,107,0,0.14)", bd: "rgba(255,107,0,0.26)", tx: "#ff6b00" },
    blue:  { bg: "rgba(59,130,246,0.15)", bd: "rgba(59,130,246,0.25)", tx: "#3b82f6" },
    gray:  { bg: "rgba(148,163,184,0.12)", bd: "rgba(148,163,184,0.22)", tx: "#cbd5e1" },
  };
  const s = map[tone] || map.gray;
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${s.bd}`,
        background: s.bg,
        color: s.tx,
        fontWeight: 1100,
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function StatCard({ title, value, sub, icon, accent = "#ff6b00" }) {
  return (
    <Glass style={{ padding: 18, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          right: -50,
          top: -50,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: accent,
          opacity: 0.10,
          filter: "blur(10px)",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div style={{ opacity: 0.7, fontWeight: 1100, letterSpacing: 1, textTransform: "uppercase", fontSize: 11 }}>
          {title}
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            fontSize: 18,
          }}
          title={title}
        >
          {icon}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 34, fontWeight: 1300, letterSpacing: -0.8 }}>
        {value}
      </div>

      <div style={{ marginTop: 8, opacity: 0.78, fontSize: 12 }}>
        {sub}
      </div>
    </Glass>
  );
}

function AddUserModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [meterId, setMeterId] = useState("");
  const [plan, setPlan] = useState("Básico Hogar");
  const [status, setStatus] = useState("ACTIVO");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(""); setEmail(""); setMeterId("");
    setPlan("Básico Hogar"); setStatus("ACTIVO");
    setErr("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 18,
      }}
      onMouseDown={onClose}
    >
      <div
        style={{
          width: 520,
          maxWidth: "100%",
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(10,12,16,0.92)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
          padding: 18,
          color: "#fff",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div style={{ fontWeight: 1300, fontSize: 18 }}>Añadir Usuario</div>
          <button
            onClick={onClose}
            style={{ border: 0, background: "transparent", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 18 }}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre (ej: Carlos Mendoza)"
            style={inputStyle}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (ej: carlos.m@example.com)"
            style={inputStyle}
          />
          <input
            value={meterId}
            onChange={(e) => setMeterId(e.target.value)}
            placeholder="ID Medidor (ej: SW-2026-001)"
            style={inputStyle}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} style={inputStyle}>
              <option>Básico Hogar</option>
              <option>Básico Social</option>
              <option>Residencial Premium</option>
              <option>Comercial Estándar</option>
              <option>Industrial Premium</option>
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
              <option value="HISTÓRICO">HISTÓRICO</option>
            </select>
          </div>

          {err && <div style={{ color: "tomato", fontWeight: 900 }}>{err}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button
              onClick={onClose}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.07)",
                color: "#fff",
                fontWeight: 1100,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>

            <button
              onClick={async () => {
                setErr("");
                if (!name.trim()) return setErr("Falta nombre");
                if (!email.trim()) return setErr("Falta email");
                if (!meterId.trim()) return setErr("Falta ID medidor");

                await onCreate({
                  name: name.trim(),
                  email: email.trim(),
                  meterId: meterId.trim(),
                  plan,
                  status,
                });
                onClose();
              }}
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(255,107,0,0.25)",
                background: "rgba(255,107,0,0.90)",
                color: "#fff",
                fontWeight: 1200,
                cursor: "pointer",
              }}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontWeight: 900,
  outline: "none",
};

function UsersTable({ rows, onDelete }) {
  return (
    <Glass style={{ padding: 18 }}>
      <div style={{ fontWeight: 1200, fontSize: 16, marginBottom: 12 }}>Gestión de Usuarios (Firestore)</div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.8, fontSize: 12 }}>
              <th style={{ padding: "10px 10px" }}>NOMBRE</th>
              <th style={{ padding: "10px 10px" }}>ID MEDIDOR</th>
              <th style={{ padding: "10px 10px" }}>PLAN</th>
              <th style={{ padding: "10px 10px" }}>ESTADO</th>
              <th style={{ padding: "10px 10px" }}>ACCIONES</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 14, opacity: 0.75 }}>
                  No hay usuarios aún. Usa “+ Añadir Usuario”.
                </td>
              </tr>
            )}

            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={{ padding: "12px 10px" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 1100,
                      }}
                    >
                      {(r.name || "U")
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 1100 }}>{r.name}</div>
                      <div style={{ opacity: 0.7, fontSize: 12 }}>{r.email}</div>
                    </div>
                  </div>
                </td>

                <td style={{ padding: "12px 10px" }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      fontWeight: 1000,
                      fontSize: 12,
                    }}
                  >
                    {r.meterId}
                  </span>
                </td>

                <td style={{ padding: "12px 10px", opacity: 0.9 }}>{r.plan}</td>

                <td style={{ padding: "12px 10px" }}>
                  {r.status === "ACTIVO" ? (
                    <Chip label="ACTIVO" tone="orange" />
                  ) : r.status === "HISTÓRICO" ? (
                    <Chip label="HISTÓRICO" tone="blue" />
                  ) : (
                    <Chip label="INACTIVO" tone="gray" />
                  )}
                </td>

                <td style={{ padding: "12px 10px", display: "flex", gap: 10 }}>
                  <button
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.07)",
                      color: "#fff",
                      fontWeight: 1100,
                      cursor: "pointer",
                    }}
                    onClick={() => alert(`Demo: ver ${r.name}`)}
                  >
                    Ver
                  </button>

                  <button
                    style={{
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(255,0,0,0.20)",
                      background: "rgba(255,0,0,0.12)",
                      color: "#fff",
                      fontWeight: 1100,
                      cursor: "pointer",
                    }}
                    onClick={() => onDelete(r.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, opacity: 0.7, fontSize: 12 }}>
        *Ahora sí son datos reales en Firestore.
      </div>
    </Glass>
  );
}

export default function AdminPage() {
  const nav = useNavigate();
  const [section, setSection] = useState("dashboard"); // dashboard | users | reports | config
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [users, setUsers] = useState([]); // datos reales

  // ✅ escuchar Firestore en tiempo real
  useEffect(() => {
    const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qUsers,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(rows);
      },
      (err) => {
        console.error("Firestore error:", err);
      }
    );
    return () => unsub();
  }, []);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return users;
    return users.filter((r) =>
      [r.name, r.email, r.meterId, r.plan, r.status].some((x) => String(x || "").toLowerCase().includes(t))
    );
  }, [users, q]);

  const chart = useMemo(() => {
    // demo (luego lo conectamos)
    return MONTHS.map((m, idx) => ({
      m,
      v: idx < 9 ? 8000 + idx * 2500 : 45000 - (idx - 9) * 4000,
    }));
  }, []);

  async function createUser(user) {
    await addDoc(collection(db, "users"), {
      ...user,
      createdAt: serverTimestamp(),
    });
  }

  async function deleteUser(id) {
    if (!confirm("¿Eliminar usuario?")) return;
    await deleteDoc(doc(db, "users", id));
  }

  function logout() {
    localStorage.removeItem("sw_token");
    localStorage.removeItem("sw_role");
    localStorage.removeItem("smartwater_user");
    nav("/login", { replace: true });
  }

  const SideItem = ({ id, label, icon }) => {
    const active = section === id;
    return (
      <button
        onClick={() => setSection(id)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 16,
          border: active ? "1px solid rgba(255,107,0,0.25)" : "1px solid transparent",
          background: active ? "rgba(255,107,0,0.12)" : "transparent",
          color: active ? "#fff" : "rgba(255,255,255,0.72)",
          cursor: "pointer",
          fontWeight: 1100,
          textAlign: "left",
        }}
      >
        <span style={{ width: 22, textAlign: "center" }}>{icon}</span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div style={{ background: "#070a10", color: "#e5e7eb", minHeight: "100vh" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "100vh" }}>
        {/* SIDEBAR */}
        <aside
          style={{
            borderRight: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            padding: 18,
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                background: "rgba(255,107,0,0.20)",
                border: "1px solid rgba(255,107,0,0.25)",
                display: "grid",
                placeItems: "center",
                fontWeight: 1200,
              }}
            >
              💧
            </div>
            <div>
              <div style={{ fontWeight: 1200, fontSize: 16 }}>
                SMARTWATER <span style={{ color: "#ff6b00" }}>ADMIN</span>
              </div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>ADMIN PANEL 2026</div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
            <SideItem id="dashboard" label="Dashboard" icon="⬛" />
            <SideItem id="users" label="Gestión de Usuarios" icon="👥" />
            <SideItem id="reports" label="Reportes" icon="📄" />
            <SideItem id="config" label="Configuración" icon="⚙️" />
          </div>

          <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, display: "grid", gap: 10 }}>
            <button
              onClick={logout}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.07)",
                color: "#fff",
                fontWeight: 1100,
                cursor: "pointer",
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ padding: 22 }}>
          {/* TOP BAR */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 22, fontWeight: 1300 }}>
              Dashboard de Administración Global
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  minWidth: 280,
                }}
              >
                <span style={{ opacity: 0.75 }}>🔎</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar usuarios..."
                  style={{
                    width: "100%",
                    border: 0,
                    outline: "none",
                    background: "transparent",
                    color: "#fff",
                    fontWeight: 900,
                  }}
                />
              </div>

              <button
                onClick={() => setModalOpen(true)}
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,107,0,0.25)",
                  background: "rgba(255,107,0,0.90)",
                  color: "#fff",
                  fontWeight: 1200,
                  cursor: "pointer",
                }}
              >
                + Añadir Usuario
              </button>
            </div>
          </div>

          {/* CONTENT */}
          {section === "dashboard" && (
            <>
              <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, minmax(240px, 1fr))", gap: 14 }}>
                <StatCard title="Total Usuarios" value={String(users.length)} sub="Firestore (tiempo real)" icon="👤" accent="#94a3b8" />
                <StatCard
                  title="Usuarios Activos"
                  value={String(users.filter((u) => u.status === "ACTIVO").length)}
                  sub="Estado = ACTIVO"
                  icon="📡"
                  accent="#ff6b00"
                />
                <StatCard
                  title="Inactivos / Hist"
                  value={String(users.filter((u) => u.status !== "ACTIVO").length)}
                  sub="INACTIVO o HISTÓRICO"
                  icon="⛔"
                  accent="#64748b"
                />
              </div>

              <Glass style={{ marginTop: 14, padding: 18 }}>
                <div style={{ fontWeight: 1200, fontSize: 16 }}>Tendencia Global (demo)</div>
                <div style={{ height: 240, minHeight: 240, width: "100%", minWidth: 0, marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart}>
                      <defs>
                        <linearGradient id="gAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.20} />
                          <stop offset="100%" stopColor="#ff6b00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                      <Tooltip
                        cursor={{ stroke: "rgba(255,255,255,0.10)", strokeWidth: 1 }}
                        contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16 }}
                        itemStyle={{ color: "#fff", fontSize: 14 }}
                      />
                      <Area type="monotone" dataKey="v" stroke="#ff6b00" strokeWidth={4} fill="url(#gAdmin)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Glass>

              <div style={{ marginTop: 14 }}>
                <UsersTable rows={rows} onDelete={deleteUser} />
              </div>
            </>
          )}

          {section === "users" && (
            <div style={{ marginTop: 16 }}>
              <UsersTable rows={rows} onDelete={deleteUser} />
            </div>
          )}

          {section === "reports" && (
            <div style={{ marginTop: 16 }}>
              <Glass style={{ padding: 18 }}>
                <div style={{ fontWeight: 1300, fontSize: 18 }}>Reportes</div>
                <div style={{ opacity: 0.75, marginTop: 6 }}>Luego conectamos con backend.</div>
              </Glass>
            </div>
          )}

          {section === "config" && (
            <div style={{ marginTop: 16 }}>
              <Glass style={{ padding: 18 }}>
                <div style={{ fontWeight: 1300, fontSize: 18 }}>Configuración</div>
                <div style={{ opacity: 0.75, marginTop: 6 }}>Luego: roles, planes, permisos, etc.</div>
              </Glass>
            </div>
          )}
        </main>
      </div>

      <AddUserModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={createUser} />
    </div>
  );
}