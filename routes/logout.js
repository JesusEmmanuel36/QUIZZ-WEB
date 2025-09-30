const express = require("express");
const router = express.Router();
const { client } = require("../db"); // usa el cliente ya conectado
 
router.post("/", async(req, res) =>{
    try{
        const db_cuentas = await client.db("QUIZZWEB");  // base de datos
        const usuarios = await db_cuentas.collection("USUARIOS");  // coleccion de usuarios

        const now = new Date()
        await usuarios.updateOne(
            { refreshToken: req.cookies.refreshToken},
            {
                $set: {
                    refreshExpires: new Date(now.getTime()),
                }
            }
        );

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({ message: "Sesión cerrada correctamente" });
    }catch(err){
        console.error(err);
        res.status(500).json({ error: "Error cerrando sesión" });
    }
 

   

     
})

module.exports = router