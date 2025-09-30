const express = require("express");
const router = express.Router();
const { client } = require("../db"); // usa el cliente ya conectado
const auth = require("../middlewares/auth");

router.post("/", auth, async(req, res) => {
    const db = await client.db("QUIZZWEB")
    const quizzes = await db.collection("QUIZZES")

    if (req.user.rol !== "admin") {
        return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
    }

    
    const data = req.body

    // Recorremos cada clave y valor
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === "object") {
            // Si es un objeto (ej: una pregunta), revisamos sus propiedades
            for (const [subKey, subValue] of Object.entries(value)) {
                if (subValue === "") {
                    return res.status(400).json({
                        error: `El campo "${subKey}" en la pregunta "${key}" está vacío`
                    });
                }
            }
        } else {
            // Si es un valor directo (ej: titulo), revisamos también
            if (value === "") {
                return res.status(400).json({
                    error: `El campo "${key}" está vacío`
               });
            }
        }
    }

    quizzes.insertOne(data)

    // Si no hay errores, continuar
     
    await res.status(200).json({ message: "Datos válidos" });
})

router.get("/", async(req, res) => {
    const db = client.db("QUIZZWEB");
    const quizzesCollection = db.collection("QUIZZES");

    const quizzes = await quizzesCollection.find({}).toArray();

    // Transformar todos los quizzes
    const quizzesAMostrar = quizzes.map(quizz => {
        const quizzObj = { 
            _id: quizz._id.toString(), // convertir ObjectId a string
            titulo: quizz.titulo
        };

        for (const key in quizz) {
            if (key !== "_id" && key !== "titulo") {
                const preguntaObj = { pregunta: quizz[key].pregunta };

                for (const key2 in quizz[key]) {
                    if (key2 !== "pregunta" && key2 !== "respuesta_correcta") {
                        preguntaObj[key2] = quizz[key][key2];
                    }
                }

                quizzObj[key] = preguntaObj;
            }
        }

        return quizzObj;
    });

    res.status(200).json(quizzesAMostrar);
});

module.exports = router