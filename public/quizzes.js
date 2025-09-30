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
            const PreguntasQuizzHolder = document.getElementById("PreguntasQuizzHolder")
            const QuizzTituloH1 = document.getElementById("QuizzTituloH1")
            const GuardarQuizz = document.getElementById("GuardarQuizz")

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
                        const urlParams = new URLSearchParams(window.location.search);

                        if (urlParams.get("id")) {
                            const id = urlParams.get("id");
                            let idEncontrado = false
                            let tituloEncontrado = ""
                            const preguntas = {} 

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

                                if (id == Id) {
                                    for (const i2 in data[i]) {
                                        if (i2 != "titulo" && i2 != "_id") {
                                            preguntas[i2] = data[i][i2]
                                        }
                                    }

                                    tituloEncontrado = Titulo
                                    idEncontrado = true
                                }


                            }




                            if (idEncontrado) { 

                                QuizzTituloH1.textContent = tituloEncontrado

                                const quizz = {
                                    quizId: id,
                                    email: cookie.usuario.correo
                                }
                                const answers = {}

                                for (const i in preguntas) {
                                    const preguntaText = preguntas[i].pregunta

                                    answers[i] = "SIN_RESPUESTA"




                                    // Crear el contenedor
                                    const preguntaHolder = document.createElement("div");
                                    preguntaHolder.className = "PreguntaQuizzHolder";
                                    preguntaHolder.id = "PreguntaQuizzHolder";

                                    // Crear el título de la pregunta
                                    const tituloPregunta = document.createElement("h1");
                                    tituloPregunta.className = "H1PreguntaQuizz";
                                    tituloPregunta.id = "H1PreguntaQuizz";
                                    tituloPregunta.textContent = i.toString() + ". " + preguntaText;

                                    // Insertar el h1 dentro del div
                                    preguntaHolder.appendChild(tituloPregunta);

                                    PreguntasQuizzHolder.appendChild(preguntaHolder)

                                    for (const i2 in preguntas[i]) {
                                        if (i2 !== "pregunta") {
                                            const respuesta = preguntas[i][i2]

                                            // Crear el botón
                                            const botonRespuesta = document.createElement("button");
                                            botonRespuesta.className = "BotonRespuestaQuizz";
                                            botonRespuesta.id = "BotonRespuestaQuizz";

                                            // Crear el div del selector
                                            const selectorDiv = document.createElement("div");
                                            selectorDiv.className = "SelectorRespuestaCorrectaDiv";
                                            selectorDiv.id = "SelectorRespuestaCorrectaDiv";

                                            // Crear la imagen
                                            const img = document.createElement("img");
                                            img.src = "imagenes/checkmark-128 2 (2).png";
                                            img.alt = "";

                                            // Agregar la imagen dentro del div
                                            selectorDiv.appendChild(img);

                                            // Crear el párrafo del texto
                                            const textoRespuesta = document.createElement("p");
                                            textoRespuesta.className = "BotonRespuestaQuizzTexto";
                                            textoRespuesta.id = "BotonRespuestaQuizzTexto";
                                            textoRespuesta.textContent = respuesta;

                                            // Insertar el div y el párrafo dentro del botón
                                            botonRespuesta.appendChild(selectorDiv);
                                            botonRespuesta.appendChild(textoRespuesta);

                                            // Agregar el botón al body (o al contenedor que quieras)
                                            preguntaHolder.appendChild(botonRespuesta);

                                            botonRespuesta.addEventListener("click", () => {
                                                for (const i3 in preguntas[i]) {
                                                    if (i3 !== "pregunta") {
                                                        const SelectoresDiv = preguntaHolder.querySelectorAll('[id^="SelectorRespuestaCorrectaDiv"]')
                                                        const SelectoresImg = preguntaHolder.querySelectorAll("img");
                                                        SelectoresImg.forEach(SelectorImg => {
                                                            SelectorImg.style.display = "none"
                                                        })
                                                        SelectoresDiv.forEach(SelectorDivApintar => {
                                                            SelectorDivApintar.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
                                                        })

                                                        selectorDiv.style.backgroundColor = "#CA33F0"
                                                        img.style.display = "flex"


                                                        answers[i] = textoRespuesta.textContent



 
                                                    }
                                                }
                                            })
                                        }

                                    }

                                }

                                GuardarQuizz.addEventListener("click", async () => {
                                    let faltaSeleccion = false



                                    for (const [i, value] in Object.entries(answers)) {
                                        if (answers[Number(i) + 1] === "SIN_RESPUESTA") {
                                            faltaSeleccion = true
                                        }
                                    }

                                    if (faltaSeleccion !== true) {  

                                        quizz["answers"] = answers


                                        const response = await fetch("/api/results", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify(quizz),
                                            credentials: "include"
                                        });

                                        if (response.status === 200) {
                                            window.location.href = "/";
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
                                            const response2 = await fetch("/api/results", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json"
                                                },
                                                body: JSON.stringify(quizz),
                                                credentials: "include"
                                            });

                                            if (response2.status === 200) {
                                                window.location.href = "/";
                                            }

                                            if (response2.status === 400) {
                                                mostrarError("Llena todos los campos");
                                            }
 
                                        }

                                    } else {
                                        mostrarError("Contesta todas las preguntas.")
                                        /// MOSTRAR ERROR AQUI DE FALTA CONTESTAR TODO
                                    }
                                })
                            } else {
                                window.location.href = "/"
                            }


                        } else {
                            window.location.href = "/"
                        }



                        if (rol === "admin") {




                        }
                    }
                }
            )
        })
})