const express = require("express");
const router = express.Router();
const { client } = require("../db"); // usa el cliente ya conectado
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
 

const SECRET = "elcacas27"; // secreto del token
const REFRESH_SECRET = "superelcacas27"; // secreto del regenerador
const ACCESS_EXPIRES = "10s";  // access token dura 15 minutos
const REFRESH_EXPIRES = "20s";  // refresh dura 7 días 7d
const REFRESH_EXPIRES_MS = 20 * 1000; // 7 * 24 * 60 * 60 * 1000

router.post("/", async (req, res) => {
  try {
    const db_cuentas =  await client.db("QUIZZWEB");  // base de datos
    const usuarios = await db_cuentas.collection("USUARIOS");  // coleccion de usuarios

    const {correo, contraseña } = req.body;

    if (!correo) { return res.status(401).json({ error: "Falta correo" }); } // si no puso correo, regresa error
    if (!contraseña) { return res.status(401).json({ error: "Falta contraseña" }); } // si no puso contraseña, regresa error
    if(!correo.includes("@")){ return res.status(400).json({error: "Ese no es un correo"})}; // si el correo no incluye @, regresa error

    const correoEncontrado = await usuarios.findOne({correo});

    if (!correoEncontrado) { return res.status(401).json({ error: "Correo no encontrado" })};
    const validPassword = await bcrypt.compare(contraseña, correoEncontrado.contraseña); 
    if (!validPassword) { return res.status(401).json({ error: "Contraseña incorrecta" }); }
 
    // usuario válido
    const payload = {correo: correoEncontrado.correo, user: correoEncontrado.user, rol: correoEncontrado.rol };

    const accessToken = jwt.sign(payload, SECRET, { expiresIn: ACCESS_EXPIRES }); 
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });

    const now = new Date();
    const refreshExpires = new Date(now.getTime() + REFRESH_EXPIRES_MS);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 1000 // 10 segundos en milisegundos
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_EXPIRES_MS // 7 días
    });

    await usuarios.updateOne(
      { correo: correoEncontrado.correo },
      {
        $set: {
          refreshToken: refreshToken,
          refreshExpires: refreshExpires,
        },
      }
    );

    res.status(202).json({message: "Sesión iniciada"});
  } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    res.status(500).send("Error al obtener la lista de usuarios");
  }
});

module.exports = router;