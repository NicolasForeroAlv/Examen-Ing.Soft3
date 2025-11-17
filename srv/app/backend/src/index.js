import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// 👉 Conexión correcta para PostgreSQL instalado en la VM (sin SSL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// Verificar conexión al iniciar
pool.connect()
  .then(() => console.log("➡️ Conectado a PostgreSQL correctamente"))
  .catch(err => console.error("❌ Error conectando a PostgreSQL:", err));

const app = express();
app.use(cors());
app.use(express.json());

// ------------ AUTH --------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users(name, email, password) VALUES($1,$2,$3)",
      [name, email, hash]
    );

    res.json({ message: "Usuario creado" });
  } catch (error) {
    console.error("❌ Error en /register:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (result.rows.length === 0)
      return res.status(400).json({ error: "No existe" });

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (error) {
    console.error("❌ Error en /login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ------------ TAREAS CRUD ----------
app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error en GET /todos:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;
    await pool.query("INSERT INTO todos(title) VALUES($1)", [title]);
    res.json({ message: "Creada" });
  } catch (error) {
    console.error("❌ Error en POST /todos:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// --------------------------------
app.get("/", (_, res) => res.send("Backend funcionando"));

app.listen(4000, () => console.log("Backend en puerto 4000"));
