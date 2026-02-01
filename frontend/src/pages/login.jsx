// frontend/src/pages/login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../auth/firebase"; // ✅ ruta correcta
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function onLogin(e) {
    e.preventDefault();
    setErr("");

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);

      // 🔐 token Firebase
      const idToken = await cred.user.getIdToken();

      // 👤 role (temporal, por texto en el email)
      const role = email.toLowerCase().includes("admin") ? "admin" : "user";

      localStorage.setItem("sw_token", idToken);
      localStorage.setItem("sw_role", role);

      nav(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Error al iniciar sesión");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#fff", padding: 30 }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>

      <form onSubmit={onLogin} style={{ display: "grid", gap: 10, maxWidth: 320 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
        />

        <input
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="password"
          type="password"
          style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
        />

        <button
          type="submit"
          style={{ padding: 12, borderRadius: 12, border: 0, background: "#ff6b00", color: "#111", fontWeight: 900, cursor: "pointer" }}
        >
          Entrar
        </button>

        {err && <div style={{ color: "tomato" }}>{err}</div>}
      </form>
    </div>
  );
}