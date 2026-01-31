import React from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../auth/firebase";
import { signInWithPopup } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Guardamos datos mínimos del usuario
      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        role: user.email === "zurielv87@gmail.com" ? "admin" : "user",
      };

      localStorage.setItem("smartwater_user", JSON.stringify(userData));

      // Redirección según rol
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión con Google");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(circle at top, #ff8c1a, #000)",
      }}
    >
      <div
        style={{
          width: 380,
          padding: 28,
          borderRadius: 22,
          background: "rgba(0,0,0,0.65)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h2>Bienvenido</h2>
        <p style={{ opacity: 0.75 }}>
          Inicia sesión en tu panel inteligente
        </p>

        <button
          onClick={handleGoogleLogin}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            border: "none",
            background: "#ff6b00",
            color: "#fff",
            fontWeight: 900,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
