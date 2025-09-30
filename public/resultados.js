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
            const HolderResultadosUsuario = document.getElementById("HolderResultadosUsuario")
            const HolderResultadosQuizzes = document.getElementById("HolderResultadosQuizzes")
            const HolderResultadosAdmin = document.getElementById("HolderResultadosAdmin")

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



                        
                            const response = await fetch("/api/results", {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                credentials: "include"
                            });
                            
                            const data = await response.json()
                          

                            if(rol === "admin"){
                                HolderResultadosAdmin.style.display = "flex"

                                 
                                
                                for (const quizz of data){ 
 
 
                                    // Crear el div principal
                                    const holder = document.createElement("div");
                                    holder.className = "HolderResultadosQuizzes";
                                    holder.id = "HolderResultadosQuizzes";

                                    // Crear el h1
                                    const h1 = document.createElement("h1");
                                    h1.className = "QuizzH1Admin";
                                    h1.textContent = quizz.titulo;

                                    // Insertar el h1 dentro del div
                                    holder.appendChild(h1);

                                    // Agregarlo al body (o a donde quieras)
                                    HolderResultadosAdmin.appendChild(holder);

                                    for(const resultado of quizz.resultados){

                                        const email = resultado.email
                                        const resultadoObtenido = resultado.resultado
                                        const fecha = resultado.fecha

                                        // Crear el contenedor principal
                                        const holder2 = document.createElement("div");
                                        holder2.className = "ResultadoDeQuizzHolderAdmin";

                                        // Email
                                        const emailH1 = document.createElement("h1");
                                        emailH1.className = "EmailQuizzH1";
                                        emailH1.id = "EmailQuizzH1";
                                        emailH1.textContent = "Email";

                                        const emailP = document.createElement("p");
                                        emailP.className = "EmailQuizzP";
                                        emailP.id = "EmailQuizzP";
                                        emailP.textContent = email;

                                        // Resultado
                                        const resultadoH1 = document.createElement("h1");
                                        resultadoH1.className = "ResultadoQuizzH1";
                                        resultadoH1.id = "ResultadoQuizzH1";
                                        resultadoH1.textContent = "Resultado";

                                        const resultadoP = document.createElement("p");
                                        resultadoP.className = "ResultadoQuizzP";
                                        resultadoP.id = "ResultadoQuizzP";
                                        resultadoP.textContent = resultadoObtenido;

                                        // Fecha
                                        const fechaH1 = document.createElement("h1");
                                        fechaH1.className = "FechaQuizzH1";
                                        fechaH1.id = "FechaQuizzH1";
                                        fechaH1.textContent = "Fecha";

                                        const fechaP = document.createElement("p");
                                        fechaP.className = "FechaQuizzP";
                                        fechaP.id = "FechaQuizzP";
                                        fechaP.textContent = fecha;

                                        // Insertar los elementos en el contenedor
                                        holder2.appendChild(emailH1);
                                        holder2.appendChild(emailP);
                                        holder2.appendChild(resultadoH1);
                                        holder2.appendChild(resultadoP);
                                        holder2.appendChild(fechaH1);
                                        holder2.appendChild(fechaP);

                                        // Agregar al body (o a donde quieras)
                                        holder.appendChild(holder2);
                                    }
                                } 
                                
                            }else if(rol === "alumno"){
                                HolderResultadosUsuario.style.display = "flex"

                                for(const quizz of data){
                                    const titulo = quizz.titulo
                                    const resultado = quizz.resultado
                                    const fecha = quizz.fecha

                                    const resultadoHolder = document.createElement("div");
                                    resultadoHolder.className = "ResultadoDeQuizzHolder";

                                    // Crear h1 del título
                                    const h1 = document.createElement("h1");
                                    h1.className = "ResultadoQuizzH1";
                                    h1.id = "ResultadoQuizzH1";
                                    h1.textContent = titulo;

                                    // Crear párrafo del resultado
                                    const pResultado = document.createElement("p");
                                    pResultado.className = "ResultadoQuizzP";
                                    pResultado.id = "ResultadoQuizzP";
                                    pResultado.textContent = `Resultado: ${resultado}`;

                                    // Crear párrafo de la fecha
                                    const pFecha = document.createElement("p");
                                    pFecha.className = "FechaQuizzP";
                                    pFecha.id = "FechaQuizzP";
                                    pFecha.textContent = `Fecha: ${fecha}`;

                                    // Agregar los elementos al contenedor
                                    resultadoHolder.appendChild(h1);
                                    resultadoHolder.appendChild(pResultado);
                                    resultadoHolder.appendChild(pFecha);

                                    HolderResultadosQuizzes.appendChild(resultadoHolder)




                                    
                                    

                                }
                            }
                    }
                }
            )
        })
})