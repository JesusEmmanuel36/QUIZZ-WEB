const express = require("express");
const router = express.Router();
const { client } = require("../db"); // usa el cliente ya conectado
const jwt = require("jsonwebtoken");

const SECRET = "elcacas27";
const REFRESH_SECRET = "superelcacas27";
const REFRESH_EXPIRES = 20 * 1000 // 7 * 24 * 60 * 60 * 1000; // 7 días en ms

router.post("/", async (req, res) => {
  //console.log(req.ip)
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

    const ip = req.ip

    console.log("IP EN REFRESH: " + ip)
    console.log("IP GUARDADA EN LOGIN: " + db_usuario.refreshExpires)

    

    const newAccessToken = jwt.sign(
      {correo: usuario.correo, user: usuario.user, rol: usuario.rol },
      SECRET,
      { expiresIn: "10s" }
    );

    const newRefreshToken = jwt.sign(
      { correo: usuario.correo, user: usuario.user, rol: usuario.rol },
      REFRESH_SECRET,
      { expiresIn: "20s" }
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
      maxAge: 10 * 1000 // 10 segundos en milisegundos
    });
    
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_EXPIRES
    });


    console.log("ACCESS TOKEN y REFRESH TOKEN renovados");

    res.status(202).json({ message: "Access tokens renovados"});
  });
});

module.exports = router;