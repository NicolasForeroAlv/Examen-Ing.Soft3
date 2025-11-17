import axios from "axios";
import { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password
      });
      alert("TOKEN: " + res.data.token);
    } catch (err) {
      setError(err?.response?.data?.error || "Error del servidor");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Login</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={login}>Ingresar</button>
    </div>
  );
}
