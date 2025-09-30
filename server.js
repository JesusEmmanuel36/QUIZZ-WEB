 
const express = require("express");
const path = require("path");
const { connectDB } = require("./db");
const cookieParser = require("cookie-parser");
 
const loginRouter = require("./routes/login");
const signupRouter = require("./routes/signup")
const authRouter = require("./routes/auth")
const refreshRouter = require("./routes/refresh")
const logoutRouter = require("./routes/logout")
const quizzesRouter = require("./routes/quizzes")
const resultsRouter = require("./routes/results")

const app = express();
const PORT = process.env.PORT || 3000;  

connectDB();

app.set("trust proxy", true);
app.use(express.json());
app.use(cookieParser())

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/login", loginRouter);
app.use("/api/signup", signupRouter);
app.use("/api/auth", authRouter)
app.use("/api/refresh", refreshRouter)
app.use("/api/logout", logoutRouter)
app.use("/api/quizzes", quizzesRouter)
app.use("/api/results", resultsRouter)
 
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/quizzes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "quizzes.html"));
});

app.get("/resultados", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "resultados.html"));
})


// Arrancar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});