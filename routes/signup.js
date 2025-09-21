const express = require("express");
const router = express.Router();
const { client } = require("../db"); // usa el cliente ya conectado
const bcrypt = require("bcrypt")

router.post("/", async (req, res) => {
  try {
    const db = client.db("QUIZZWEB");  // base de datos
    const collection = db.collection("USUARIOS");  // coleccion de usuarios

    const {user, correo, contraseña } = req.body; // carga usuario, correo y contraseña del request

    if (!user) { return res.status(401).json({ error: "Falta user" }); } // si no puso user, regresa error
    if (!correo) { return res.status(401).json({ error: "Falta correo" }); } // si no puso correo, regresa error
    if (!contraseña) { return res.status(401).json({ error: "Falta contraseña" }); } // si no puso contraseña, regresa error

    if(!correo.includes("@")){ return res.status(400).json({error: "Ese no es un correo"})}; // si el correo no incluye @, regresa error

    const correoExistente = await collection.findOne({correo}) // Busca si el correo existe

    if (correoExistente) {return res.status(400).json({error: "El correo ya existe"})} // si el correo ya esta registrado manda error
    
    // si todas las condicienes pasaron 

    const hash = await bcrypt.hash(contraseña, 10) // hhashea la contraseña

    const nuevoUsuario = { 
      user,
      correo,
      contraseña: hash,
      rol: "alumno"
    }

    await collection.insertOne(nuevoUsuario) // inserta el nuevo usuario en la base de datos

    res.status(201).json({message: "Usuario creado con éxito"})
  } catch (error) {
    console.error("Error en la base de datos:", error);
    res.status(500).send("Error en la base de datos");
  }
});

module.exports = router;