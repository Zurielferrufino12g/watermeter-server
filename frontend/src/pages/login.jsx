// src/pages/login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../auth/firebase"; // ✅ RUTA CORRECTA
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

      // 👤 role (temporal)
      const role = email.includes("admin") ? "admin" : "user";

      localStorage.setItem("sw_token", idToken);
      localStorage.setItem("sw_role", role);

      nav(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2.message || "Error al iniciar sesión");
    }
  }

  return (
    <div style={{ padding: 30, color: "#fff" }}>
      <h2>Login</h2>

      <form
        onSubmit={onLogin}
        style={{ display: "grid", gap: 10, maxWidth: 320 }}
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />

        <input
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="password"
          type="password"
        />

        <button type="submit">Entrar</button>

        {err && <div style={{ color: "tomato" }}>{err}</div>}
      </form>
    </div>
  );
}
