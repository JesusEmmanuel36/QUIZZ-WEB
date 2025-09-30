const express = require("express");
const router = express.Router();
const { client } = require("../db"); // usa el cliente ya conectado
const jwt = require("jsonwebtoken");

const SECRET = "elcacas27";
const REFRESH_SECRET = "superelcacas27";
const ACCESS_EXPIRES = "15m";  // access token dura 15 minutos
const REFRESH_EXPIRES = "7d";  // refresh dura 7 días 7d
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;
const ACCESS_EXPIRES_MS = 15 * 60 * 1000

router.post("/", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "No hay refresh token" });

  const db_cuentas = await client.db("QUIZZWEB");  // base de datos
  const usuarios = await db_cuentas.collection("USUARIOS");  // coleccion de usuarios

   
  jwt.verify(refreshToken, REFRESH_SECRET, async (err, usuario) => {
    if (err) return res.status(403).json({ error: "Refresh token inválido" });

    const db_usuario = await usuarios.findOne({correo: usuario.correo, refreshToken });

    if (!db_usuario) {
      return res.status(403).json({ error: "Refresh token no encontrado o ya rotado"});
    }
 

    if (new Date() > db_usuario.refreshExpires) {
      console.log("Refresh token expirado")
      return res.status(403).json({ error: "Refresh token expirado" });
    }
 

    

    const newAccessToken = jwt.sign(
      {correo: usuario.correo, user: usuario.user, rol: usuario.rol },
      SECRET,
      { expiresIn: ACCESS_EXPIRES }
    );

    const newRefreshToken = jwt.sign(
      { correo: usuario.correo, user: usuario.user, rol: usuario.rol },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES }
    );

    await usuarios.updateOne(
      { correo: usuario.correo },
      {
        $set: {
          refreshToken: newRefreshToken,
        }
      }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ACCESS_EXPIRES_MS // 15 minutos en milisegundos
    });
    
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_EXPIRES_MS
    });


    console.log("ACCESS TOKEN y REFRESH TOKEN renovados");

    res.status(202).json({ message: "Access tokens renovados"});
  });
});

module.exports = router;