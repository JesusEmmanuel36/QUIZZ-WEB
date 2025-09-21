const express = require("express");
const router = express.Router();
const { client } = require("../db"); // usa el cliente ya conectado
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");

const SECRET = "elcacas27"; // secreto del token

router.get("/", async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ error: "No autorizado" });

    try {
        const decoded = jwt.verify(token, SECRET);
        res.status(202).json({ usuario: decoded });
    } catch (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
})

module.exports = router