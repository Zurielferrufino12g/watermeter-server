// frontend/src/pages/login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../auth/firebase";
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleGoogle() {
    try {
      setErr("");
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // ✅ token firebase
      const idToken = await user.getIdToken();

      // ✅ rol: lo definimos por Firestore después (por ahora, fallback por email)
      // Si ya guardas role en Firestore, luego lo leemos y reemplazamos esto.
      const role = (user.email || "").toLowerCase().includes("admin") ? "admin" : "user";

      localStorage.setItem("sw_token", idToken);
      localStorage.setItem("sw_role", role);

      localStorage.setItem(
        "smartwater_user",
        JSON.stringify({
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          photo: user.photoURL || "",
          role,
        })
      );

      nav(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (e) {
      console.error(e);
      setErr(e?.code ? `Firebase: ${e.code}` : "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  }

  const glass = {
    borderRadius: 26,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 18,
        color: "#fff",
        background:
          "radial-gradient(1200px 700px at 20% 15%, rgba(255,140,26,0.35), rgba(0,0,0,0) 60%), radial-gradient(900px 600px at 80% 80%, rgba(59,130,246,0.22), rgba(0,0,0,0) 55%), #070a10",
      }}
    >
      {/* top bar (marca) */}
      <div
        style={{
          position: "fixed",
          top: 18,
          left: 18,
          right: 18,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: 0.9,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 1100 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,107,0,0.18)",
              border: "1px solid rgba(255,107,0,0.25)",
            }}
          >
            💧
          </div>
          <div>SmartWater 2026</div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          ¿No tienes cuenta? <span style={{ color: "#ff6b00", fontWeight: 1100 }}>Regístrate</span>
        </div>
      </div>

      {/* card */}
      <div style={{ width: 420, maxWidth: "calc(100vw - 32px)", padding: 26, ...glass }}>
        <div style={{ textAlign: "center", padding: "6px 6px 18px" }}>
          <div style={{ fontSize: 34, fontWeight: 1300, letterSpacing: -0.6 }}>Bienvenido</div>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            Inicia sesión en tu panel inteligente
          </div>
        </div>

        {/* botón único */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px 16px",
            borderRadius: 16,
            border: "1px solid rgba(255,107,0,0.25)",
            background: "rgba(255,107,0,0.92)",
            color: "#fff",
            fontWeight: 1300,
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0 18px 40px rgba(255,107,0,0.15)",
            opacity: loading ? 0.75 : 1,
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.18)",
              fontWeight: 1200,
            }}
          >
            G
          </span>
          {loading ? "Conectando..." : "Continuar con Google"}
        </button>

        {err && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 14,
              border: "1px solid rgba(239,68,68,0.25)",
              background: "rgba(239,68,68,0.10)",
              color: "#fecaca",
              fontWeight: 900,
              fontSize: 12,
            }}
          >
            {err}
          </div>
        )}

        <div style={{ marginTop: 18, opacity: 0.55, textAlign: "center", fontSize: 11 }}>
          © 2026 SmartWater Systems · Innovación para el futuro del agua
        </div>
      </div>
    </div>
  );
}
