import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import PDFDocument from "pdfkit";
import db from "./db.js";
import { predictRisk } from "./model.js";
import { generateToken, verifyToken } from "./auth.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.query(
    "INSERT INTO users (email,password) VALUES (?,?)",
    [email, hash],
    () => res.json({ message: "Usuário criado" })
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {
      if (!result.length)
        return res.status(400).json({ error: "Usuário não encontrado" });
      const valid = await bcrypt.compare(password, result[0].password);
      if (!valid) return res.status(400).json({ error: "Senha inválida" });
      const token = generateToken(result[0]);
      res.json({ token });
    }
  );
});

app.post("/predict", verifyToken, async (req, res) => {
  const { attendance, grade, behavior, participation } = req.body;
  const risk = await predictRisk(
    Number(attendance),
    Number(grade),
    Number(behavior),
    Number(participation)
  );
  db.query(
    "INSERT INTO students (attendance,grade,behavior,participation,risk) VALUES (?,?,?,?,?)",
    [attendance, grade, behavior, participation, risk]
  );
  res.json({ risk });
});

app.get("/students", verifyToken, (req, res) => {
  db.query("SELECT * FROM students", (err, result) => {
    res.json(result);
  });
});

app.get("/report", verifyToken, (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.fontSize(18).text("Relatório Executivo - EduPredict");
    results.forEach((s) => {
      doc.text(`Aluno ${s.id} - Risco: ${(s.risk * 100).toFixed(2)}%`);
    });
    doc.end();
  });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
