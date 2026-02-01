import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, googleProvider, db } from "../auth/firebase";

export default function LoginPage() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setErr("");
    setLoading(true);

    try {
      // 1) Login Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2) Token Firebase
      const idToken = await user.getIdToken();

      // 3) Leer rol desde Firestore: users/{uid}
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      let role = "user";
      let active = true;

      if (snap.exists()) {
        const data = snap.data();
        role = (data.role || "user").toLowerCase();
        active = data.active !== false;
      } else {
        // 4) Si no existe el documento, lo creamos como user por defecto
        await setDoc(ref, {
          email: user.email || "",
          role: "user",
          active: true,
          createdAt: serverTimestamp(),
        });
      }

      if (!active) {
        throw new Error("Tu cuenta está desactivada. Contacta al administrador.");
      }

      // 5) Guardar sesión para tus guards de App.jsx
      localStorage.setItem("sw_token", idToken);
      localStorage.setItem("sw_role", role);

      // (opcional) guardar datos visibles
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

      // 6) Redirigir
      nav(role === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(circle at top, #ff8c1a, #000)",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: 420,
          maxWidth: "calc(100vw - 40px)",
          padding: 28,
          borderRadius: 22,
          background: "rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.15)",
          textAlign: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>Bienvenido</h2>
        <p style={{ opacity: 0.75, marginTop: 8 }}>Inicia sesión en tu panel inteligente</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            border: "none",
            background: loading ? "rgba(255,107,0,0.55)" : "#ff6b00",
            color: "#fff",
            fontWeight: 900,
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Conectando..." : "Continuar con Google"}
        </button>

        {err && (
          <div style={{ marginTop: 14, color: "tomato", fontWeight: 700 }}>
            {err}
          </div>
        )}
      </div>
    </div>
  );
}