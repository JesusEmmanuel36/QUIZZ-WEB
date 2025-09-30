const express = require("express");
const router = express.Router();
const { client } = require("../db"); // usa el cliente ya conectado
const { ObjectId } = require("mongodb");
const auth = require("../middlewares/auth");

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date; // diferencia en milisegundos

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (seconds < 60) return "Justo ahora";
    if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
    if (hours < 24) return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    return `Hace ${days} ${days === 1 ? "día" : "días"}`;
}

router.post("/", auth, async (req, res) =>{
    const db = await client.db("QUIZZWEB")
    const resultados  = await db.collection("RESULTADOS")
    const quizzes = db.collection("QUIZZES")
    const usuarios = db.collection("USUARIOS")
     
    const email = req.user.correo;
    const usuario = await usuarios.findOne({ correo: email});

    const { quizId, answers } = req.body;

    const quiz = await quizzes.findOne({ _id: new ObjectId(quizId) });

    if (!email) return res.status(400).json({ error: "No se encontró el correo del usuario" });
    if (!usuario) return res.status(400).json({ error: "No se encontró el usuario en la bd" });
    if (!quiz) return res.status(404).json({ error: "Quiz no encontrado" });

    let respuestaIncluida = true
    let respuestasPosibles = []

    for (const i2 in quiz){
        for (const i3 in quiz[i2]){
            if(i3.includes("respuesta") && i3 !== "respuesta_correcta"){
                respuestasPosibles.push(quiz[i2][i3])
            }
        }
    }

    for (const i in answers){
        if(!respuestasPosibles.includes(answers[i])){
            respuestaIncluida = false
        }
    }

    if(!respuestaIncluida) return res.status(400).json({ error: "Respuestas inválidas" });
 
    let correctas = 0
    const total = Object.keys(answers).length
    
    for (const i in answers){
            for (const i2 in quiz[i]){
                if(i2 == "respuesta_correcta"){
                    const respuestaCorrecta = quiz[i][i2]
                    const respuestaUsuario = answers[i]
                    if(respuestaUsuario === respuestaCorrecta){
                        correctas+=1
                    }
                }
            }
    }
 
    const score = Math.round((correctas / total) * 100);

    await resultados.updateOne(
        { quizId: quiz._id, email },
        {
            $set: {
                score,
                answeredAt: new Date()
            }
        },
        {upsert: true}
    )

    res.status(200).json(score)
})

router.get("/", auth, async (req, res) =>{
    const db = await client.db("QUIZZWEB")
    const resultados  = await db.collection("RESULTADOS") 
    const usuarios = await db.collection("USUARIOS")
    const quizzes = await db.collection("QUIZZES")
 
    const email = req.user.correo;
    const rol = req.user.rol
    const usuario = await usuarios.findOne({ correo: email}); 

     

    if (!email) return res.status(400).json({ error: "No se encontró el correo del usuario" });
    if (!rol) return res.status(400).json({ error: "No se encontró el rol del usuario" });
    if (!usuario) return res.status(400).json({ error: "No se encontró el usuario en la bd" }); 
    
    const resultsCollection = await resultados.find({email}).toArray()
    const allResultadosCollection = await resultados.find({}).toArray()

 

    const userResults = [];
    const adminResults = []

    for (const resultado of resultsCollection) {
        const quizz = await quizzes.findOne({ _id: resultado.quizId });
        userResults.push({
            titulo: quizz.titulo,
            resultado: resultado.score,
            fecha: timeAgo(resultado.answeredAt)
        });
    }

    function adminResultsIncludes(titulo){
        for (result of adminResults){
             if(result.titulo === titulo) return true
        } 
        return false
    } 
    

    for (const resultado of allResultadosCollection) {
        const quizz = await quizzes.findOne({_id: resultado.quizId});

        const includes = adminResultsIncludes(quizz.titulo) 
        if(!includes){
            adminResults.push({
                titulo: quizz.titulo,
                resultados: []
            })
        }

        const userResult = {email: resultado.email, resultado: resultado.score, fecha: timeAgo(resultado.answeredAt)}
        const obj = adminResults.find(item => item.titulo === quizz.titulo);

        obj["resultados"].push(userResult) 

    }

    if(rol === "admin"){
        res.status(200).json(adminResults)
    }else if (rol === "alumno"){
        if (!resultsCollection || resultsCollection.length === 0) {
            return res.status(400).json({ error: "No se encontró el email en la lista de resultados" });
        }

        res.status(200).json(userResults)
    } 

    res.status(200)






})

module.exports = router