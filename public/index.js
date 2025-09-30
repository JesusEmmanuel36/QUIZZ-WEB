async function loadUser() {
    try {
        const req = await fetch("/api/auth", {
            credentials: "include"
        }) // manda cookies


        if (req.status !== 202) {
            // intentar refresh de cookie
 
            const refreshReq = await fetch("/api/refresh", {
                method: "POST",
                credentials: "include"
            }) // manda cookies

            if (refreshReq.status !== 202) {
                console.log("Sesión expirada, redirigiendo a login...");
                window.location.href = "/login";
                return null
            }

            return loadUser();
        }

        const data = await req.json()
        return data

    } catch (err) {
        console.error("Error obteniendo usuario:", err);
        return null;
    }
}

function mostrarError(mensaje) {
    // Crear un div para el error
    const errorDiv = document.createElement("div");
    errorDiv.textContent = mensaje;

    // Estilos básicos para que se vea
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "20px";
    errorDiv.style.left = "50%";
    errorDiv.style.transform = "translateX(-50%)";
    errorDiv.style.backgroundColor = "rgba(255,0,0,0.8)";
    errorDiv.style.color = "white";
    errorDiv.style.padding = "10px 20px";
    errorDiv.style.borderRadius = "5px";
    errorDiv.style.zIndex = "9999";
    errorDiv.style.fontFamily = "Inter";
    errorDiv.style.fontSize = "18px";

    document.body.appendChild(errorDiv);

    // Desaparece solo después de 3 segundos
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}



document.addEventListener("DOMContentLoaded", () => {
    fetch("navbar.html")

        .then(res => res.text())
        .then(data => {
            const botonMenu = document.getElementById("MenuButton")
            const menu = document.getElementById("SeccionesCelular")
            const botonesIniciarSesión = document.querySelectorAll("#IniciarSesión");
            const botonAñadir = document.getElementById("Añadir")
            const QuizMakerHolder = document.getElementById("QuizMakerHolder")
            const QuestionsHolder = document.getElementById("QuestionsHolder")
            const AgregarPregunta = document.getElementById("AgregarPregunta")
            const CrearQuizz = document.getElementById("CrearQuizz")
            const CancelarQuizz = document.getElementById("CancelarQuizz")
            const RespuestaHolder = document.getElementById("RespuestaHolder1-2")
            const AgregarRespuesta = document.getElementById("AgregarRespuesta")
            const MainHolder = document.getElementById("MainHolder")

            botonMenu.addEventListener("click", () => {

                if (menu.style.display == "flex") {
                    menu.style.display = "none"
                } else {
                    menu.style.display = "flex"
                }
            })

            window.addEventListener("resize", () => {
                if (window.innerWidth > 530) {
                    if (menu.style.display == "flex") {
                        menu.style.display = "none"
                    }
                }
            })


            loadUser().then(
                async cookie => {
                    if (cookie) {
                        const rol = cookie.usuario.rol
                        botonesIniciarSesión.forEach(boton => {
                            boton.textContent = "Cerrar Sesión"
                            boton.addEventListener("click", async () => {
                                // REQUEST A CERRAR SESIÓN
                                const response = await fetch("/api/logout", {
                                    method: "POST",
                                    credentials: "include"
                                }); 

                                if (response.status == 200) {
                                    window.location.href = "/login"
                                }
                            });
                        });

                        ///// 
                        const response = await fetch("/api/quizzes", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json"
                            },
                        });

                        const data = await response.json();
 
                        for (const i in data) {
                            const Titulo = data[i]["titulo"]
                            const Id = data[i]["_id"]

                            var NumPreguntas = 0

                            for (const i2 in data[i]) {
                                if (i2 != "titulo" && i2 != "_id") {
                                    NumPreguntas += 1
                                }
                            }

                            const quizzHolder = document.createElement("div");
                            quizzHolder.className = "QuizzHolder";

                            const h1 = document.createElement("h1");
                            h1.textContent = Titulo;

                            const p = document.createElement("p");
                            p.textContent = NumPreguntas.toString() + " Preguntas";

                            const contestar = document.createElement("button");
                            contestar.textContent = "Contestar";

                            quizzHolder.appendChild(h1);
                            quizzHolder.appendChild(p);
                            quizzHolder.appendChild(contestar);

                            MainHolder.appendChild(quizzHolder);

                            contestar.addEventListener("click", () => {
                                window.location.href = "/quizzes?id=" + Id
                            })

                        }

                        if (rol === "admin") {


                            botonAñadir.style.display = "inline-block"
                            botonAñadir.addEventListener("click", () => {
                                QuizMakerHolder.style.display = "flex"
                                const botonesSelectorDeCorrecta = QuestionsHolder.querySelectorAll('[id^="SeleccionRespuesta"]')
                                botonesSelectorDeCorrecta.forEach(otroBoton => {
                                    otroBoton.style.backgroundColor = "#101010"
                                    otroBoton.style.border = "1px solid #696969"
                                })

                                botonesSelectorDeCorrecta.forEach(boton => {
                                    boton.addEventListener("click", () => {
                                        const botonesSelectorDeCorrecta = QuestionsHolder.querySelectorAll('[id^="SeleccionRespuesta"]')
                                        botonesSelectorDeCorrecta.forEach(otroBoton => {
                                            otroBoton.style.backgroundColor = "#101010"
                                            otroBoton.style.border = "1px solid #696969"


                                        })

                                        boton.style.backgroundColor = "#CA33F0"
                                        boton.style.border = "1px solid #CA33F0" 
                                    })
                                });
                            })



                            AgregarRespuesta.addEventListener("click", () => {
                                const NumeroDeRespuestaaa = (QuestionsHolder.querySelectorAll('[id^="RespuestaHolder"]').length);
                                const CopiaRespuestaHolder = RespuestaHolder.cloneNode(true)
                                const respuesta = CopiaRespuestaHolder.querySelector("#RespuestaQuizz1-2")
                                const botonSelectorCorrecto = CopiaRespuestaHolder.querySelector("#SeleccionRespuesta1-2")
                                CopiaRespuestaHolder.id = "RespuestaHolder1-" + (NumeroDeRespuestaaa + 1).toString()
                                respuesta.id = "RespuestaQuizz1-" + (NumeroDeRespuestaaa + 1).toString()
                                botonSelectorCorrecto.id = "SeleccionRespuesta1-" + (NumeroDeRespuestaaa + 1).toString()
                                QuestionsHolder.appendChild(CopiaRespuestaHolder)
                                respuesta.value = ""

                                botonSelectorCorrecto.style.backgroundColor = "#101010"
                                botonSelectorCorrecto.style.border = "1px solid #696969"
                                /*
                                const botonesSelectorDeCorrecta = QuestionsHolder.querySelectorAll('[id^="SeleccionRespuesta"]')
                                botonesSelectorDeCorrecta.forEach(otroBoton => {
                                    otroBoton.style.backgroundColor = "#101010"
                                    otroBoton.style.border = "1px solid #696969" 
                                })
                                */

                                const botonesSelectorDeCorrecta = QuestionsHolder.querySelectorAll('[id^="SeleccionRespuesta"]')

                                botonesSelectorDeCorrecta.forEach(boton => {
                                    boton.addEventListener("click", () => {
                                        const botonesSelectorDeCorrecta = QuestionsHolder.querySelectorAll('[id^="SeleccionRespuesta"]')
                                        botonesSelectorDeCorrecta.forEach(otroBoton => {
                                            otroBoton.style.backgroundColor = "#101010"
                                            otroBoton.style.border = "1px solid #696969"

                                        })

                                        boton.style.backgroundColor = "#CA33F0"
                                        boton.style.border = "1px solid #CA33F0" 
                                    })
                                });


                            })



                            AgregarPregunta.addEventListener("click", () => {
                                const NumeroDePregunta = (QuizMakerHolder.querySelectorAll('[id^="QuestionsHolder"]').length);
                                const copiaPregunta = QuestionsHolder.cloneNode(true);
                                copiaPregunta.id = "QuestionsHolder" + (NumeroDePregunta + 1).toString()

                                const respuestas = copiaPregunta.querySelectorAll('[id^="RespuestaHolder"]')


                                if (respuestas.length > 2) {
                                    respuestas.forEach(respuesta => {
                                        const numeroDePregunta = respuesta.id.split("-")[1]
                                        if (Number(numeroDePregunta) > 2) {
                                            copiaPregunta.removeChild(respuesta)
                                        }
                                    })
                                }

                                const botonesSelectorCorrecta = copiaPregunta.querySelectorAll('[id^="SeleccionRespuesta"]')
                                botonesSelectorCorrecta.forEach(otroBoton => {
                                    otroBoton.style.backgroundColor = "#101010"
                                    otroBoton.style.border = "1px solid #696969"
                                })



                                QuizMakerHolder.removeChild(CrearQuizz)
                                QuizMakerHolder.removeChild(CancelarQuizz)
                                QuizMakerHolder.appendChild(copiaPregunta);
                                QuizMakerHolder.appendChild(CrearQuizz)
                                QuizMakerHolder.appendChild(CancelarQuizz)

                                const preguntaQuizz = copiaPregunta.querySelector("#PreguntaQuizz1")
                                const respuestaHolder1 = copiaPregunta.querySelector("#RespuestaHolder1-1")
                                const respuestaHolder2 = copiaPregunta.querySelector("#RespuestaHolder1-2")
                                const respuesta1 = copiaPregunta.querySelector("#RespuestaQuizz1-1")
                                const respuesta2 = copiaPregunta.querySelector("#RespuestaQuizz1-2")
                                const botonSelectorDeCorrecta1 = copiaPregunta.querySelector("#SeleccionRespuesta1-1")
                                const botonSelectorDeCorrecta2 = copiaPregunta.querySelector("#SeleccionRespuesta1-2")

                                preguntaQuizz.value = ""
                                respuesta1.value = ""
                                respuesta2.value = ""

                                preguntaQuizz.id = "PreguntaQuizz" + (NumeroDePregunta + 1).toString()
                                respuestaHolder1.id = "RespuestaHolder" + (NumeroDePregunta + 1).toString() + "-1"
                                respuestaHolder2.id = "RespuestaHolder" + (NumeroDePregunta + 1).toString() + "-2"
                                respuesta1.id = "RespuestaQuizz" + (NumeroDePregunta + 1).toString() + "-1"
                                respuesta2.id = "RespuestaQuizz" + (NumeroDePregunta + 1).toString() + "-2"
                                botonSelectorDeCorrecta1.id = "SeleccionRespuesta" + (NumeroDePregunta + 1).toString() + "-1"
                                botonSelectorDeCorrecta2.id = "SeleccionRespuesta" + (NumeroDePregunta + 1).toString() + "-2"

                                const botonesSelectorDeCorrecta = copiaPregunta.querySelectorAll('[id^="SeleccionRespuesta"]')
                                botonesSelectorDeCorrecta.forEach(boton => {
                                    boton.addEventListener("click", () => {
                                        const botonesSelectorDeCorrecta = copiaPregunta.querySelectorAll('[id^="SeleccionRespuesta"]')
                                        botonesSelectorDeCorrecta.forEach(otroBoton => {
                                            otroBoton.style.backgroundColor = "#101010"
                                            otroBoton.style.border = "1px solid #696969"

                                        })

                                        boton.style.backgroundColor = "#CA33F0"
                                        boton.style.border = "1px solid #CA33F0" 
                                    })
                                });

                                const AgregarRespuesta = copiaPregunta.querySelector("#AgregarRespuesta")
                                AgregarRespuesta.addEventListener("click", () => {
                                    const NumeroDeRespuesta = (copiaPregunta.querySelectorAll('[id^="RespuestaHolder"]').length);
                                    // aqui
                                    const copiaRespuesta = RespuestaHolder.cloneNode(true)
                                    const copiaRespuestaQuizz = copiaRespuesta.querySelector("#RespuestaQuizz1-2")
                                    const copiaBotonSelectorDeCorrecta = copiaRespuesta.querySelector("#SeleccionRespuesta1-2")

                                    copiaRespuesta.id = "RespuestaHolder" + (NumeroDePregunta + 1).toString() + "-" + (NumeroDeRespuesta + 1).toString()
                                    copiaRespuestaQuizz.id = "RespuestaQuizz" + (NumeroDePregunta + 1).toString() + "-" + (NumeroDeRespuesta + 1).toString()
                                    copiaBotonSelectorDeCorrecta.id = "SeleccionRespuesta" + (NumeroDePregunta + 1).toString() + "-" + (NumeroDeRespuesta + 1).toString() 

                                    copiaRespuestaQuizz.value = ""

                                    copiaBotonSelectorDeCorrecta.style.backgroundColor = "#101010"
                                    copiaBotonSelectorDeCorrecta.style.border = "1px solid #696969"

                                    copiaBotonSelectorDeCorrecta.addEventListener("click", () => {
                                        const botonesSelectorDeCorrecta = copiaPregunta.querySelectorAll('[id^="SeleccionRespuesta"]')
                                        botonesSelectorDeCorrecta.forEach(otroBoton => {
                                            otroBoton.style.backgroundColor = "#101010"
                                            otroBoton.style.border = "1px solid #696969"
                                        })

                                        copiaBotonSelectorDeCorrecta.style.backgroundColor = "#CA33F0"
                                        copiaBotonSelectorDeCorrecta.style.border = "1px solid #CA33F0" 
                                    })

                                    copiaPregunta.appendChild(copiaRespuesta)
                                }) 
                            })

                            CancelarQuizz.addEventListener("click", () => {
                                const HoldersPreguntas = QuizMakerHolder.querySelectorAll('[id^="QuestionsHolder"]');

                                HoldersPreguntas.forEach(pregunta => {

                                    if ((pregunta.id).length > 15) {
                                        QuizMakerHolder.removeChild(pregunta)
                                    } else {

                                        const respuestas = pregunta.querySelectorAll('[id^="RespuestaHolder"]')

                                        if (respuestas.length > 2) {
                                            respuestas.forEach(respuesta => {
                                                const numeroDePregunta = respuesta.id.split("-")[1]
                                                if (Number(numeroDePregunta) > 2) {
                                                    pregunta.removeChild(respuesta)
                                                }

                                                //pregunta.removeChild(respuesta)
                                            })
                                        }

                                    }
                                })

                                QuizMakerHolder.style.display = "none"
                            })

                            CrearQuizz.addEventListener("click", async () => {
                                var faltaSeleccion = false
                                const botonesSelector = QuizMakerHolder.querySelectorAll('[id^="SeleccionRespuesta"]')
                                const HoldersPreguntas = QuizMakerHolder.querySelectorAll('[id^="QuestionsHolder"]');
                                const titulo = QuizMakerHolder.querySelector('[id^="TituloQuizz"]');



                                const Quizz = {
                                    titulo: titulo.value
                                }

                                HoldersPreguntas.forEach(preguntaHolder => {
                                    var existeSeleccion = false
                                    const preguntaInput = preguntaHolder.querySelector('[id^="PreguntaQuizz"]');
                                    const respuestasInput = preguntaHolder.querySelectorAll('[id^="RespuestaQuizz"]')
                                    const botonSelectors = preguntaHolder.querySelectorAll('[id^="SeleccionRespuesta"]')
                                    var respuestaCorrecta

                                    botonSelectors.forEach(boton => { 

                                        if (boton.style.backgroundColor == "rgb(202, 51, 240)") {
                                            const seleccion = (boton.id).split("SeleccionRespuesta")[1]
                                            respuestaCorrecta = preguntaHolder.querySelector("#RespuestaQuizz" + seleccion).value

                                            existeSeleccion = true
                                        }
                                    })


                                    const num_pregunta = (preguntaInput.id).split("PreguntaQuizz")[1]
                                    const pregunta = preguntaInput.value

                                    Quizz[num_pregunta] = {}
                                    Quizz[num_pregunta]["pregunta"] = pregunta
                                    Quizz[num_pregunta]["respuesta_correcta"] = respuestaCorrecta


                                    respuestasInput.forEach(respuestaInput => {
                                        const num_respuesta = (respuestaInput.id).split("RespuestaQuizz")[1].split("-")[1]
                                        const respuesta = respuestaInput.value

                                        Quizz[num_pregunta]["respuesta" + num_respuesta] = respuesta
                                    })

                                    if (!existeSeleccion) {
                                        faltaSeleccion = true
                                    }



                                })

                                if (!faltaSeleccion) { 

                                    const response = await fetch("/api/quizzes", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify(Quizz),
                                        credentials: "include"
                                    });

                                    if (response.status === 200) {
                                        window.location.reload(); // con esto basta, no necesitas window.location.href
                                    }

                                    if (response.status === 400) {
                                        mostrarError("Llena todos los campos");
                                    }

                                    // Access token expirado o inválido
                                    if (response.status === 401 || response.status === 403) {
                                        console.log("Access token inválido/expirado, intentando refresh...");

                                        const refreshReq = await fetch("/api/refresh", {
                                            method: "POST",
                                            credentials: "include"
                                        });

                                        if (refreshReq.status !== 202) {
                                            console.log("Sesión expirada, redirigiendo a login...");
                                            window.location.href = "/login";
                                            return;
                                        }

                                        console.log("Access token renovado, repitiendo request original...");

                                        // Reintentar la petición original
                                        const response2 = await fetch("/api/quizzes", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify(Quizz),
                                            credentials: "include"
                                        });

                                        if (response2.status === 200) {
                                            window.location.reload();
                                        }

                                        if (response2.status === 400) {
                                            mostrarError("Llena todos los campos");
                                        }

                                        if (response2.status === 401 || response2.status === 403) {
                                            console.log("El refresh no fue suficiente, redirigiendo a login...");
                                            window.location.href = "/login";
                                        }
                                    }

                                }else{
                                    mostrarError("Llena todos los campos");
                                } 

                            })




                        }
                    }
                }
            )
        })
})