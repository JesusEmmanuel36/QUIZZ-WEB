const email = document.getElementById("email")
const password = document.getElementById("password")
const entrar = document.getElementById("entrar")

const errorHolderEmail = document.getElementById("ErrorHolderEmail")
const errorHolderContraseña = document.getElementById("ErrorHolderContraseña")

const acceder = document.getElementById("CrearCuenta")

acceder.addEventListener("click", () => {
    window.location.href = "/signup"
})
 


entrar.addEventListener("click", async () => {
    const emailTextBox = email.value
    const contraTextBox = password.value

    const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"correo": emailTextBox, "contraseña": contraTextBox})
    });

    const data = await response.json();

    if(response.status != 202){
        // Reset de todos antes
        email.style.border = "1px solid #696969";
        email.style.color = "#696969";
        email.classList.remove("input-rojo");
        errorHolderEmail.style.display = "none";

        password.style.border = "1px solid #696969";
        password.style.color = "#696969";
        password.classList.remove("input-rojo");
        errorHolderContraseña.style.display = "none";

        // Luego solo aplicas si coincide el error
        if (data.error == "Ese no es un correo") {
            errorHolderEmail.textContent = "Correo Invalido";
            errorHolderEmail.style.display = "flex";
            email.style.border = "1px solid red";
            email.style.color = "red";
            email.classList.add("input-rojo");
        }

        if (data.error == "Correo no encontrado") {
            errorHolderEmail.textContent = "Correo no encontrado";
            errorHolderEmail.style.display = "flex";
            email.style.border = "1px solid red";
            email.style.color = "red";
            email.classList.add("input-rojo");
        }

        if (data.error == "Falta correo") {
            errorHolderEmail.textContent = "Ingrese correo";
            errorHolderEmail.style.display = "flex";
            email.style.border = "1px solid red";
            email.style.color = "red";
            email.classList.add("input-rojo");
        }

        if (data.error == "Contraseña incorrecta") {
            errorHolderContraseña.textContent = "Contraseña Incorrecta";
            errorHolderContraseña.style.display = "flex";
            password.style.border = "1px solid red";
            password.style.color = "red";
            password.classList.add("input-rojo");
        }

        if (data.error == "Falta contraseña") {
            errorHolderContraseña.textContent = "Ingrese contraseña";
            errorHolderContraseña.style.display = "flex";
            password.style.border = "1px solid red";
            password.style.color = "red";
            password.classList.add("input-rojo");
        }

        console.log(data.error);
    }else{
        email.style.border = "1px solid #696969";
        email.style.color = "#696969";
        email.classList.remove("input-rojo");
        errorHolderEmail.style.display = "none";

        password.style.border = "1px solid #696969";
        password.style.color = "#696969";
        password.classList.remove("input-rojo");
        errorHolderContraseña.style.display = "none";

        console.log(response.status)

        setTimeout(() => {
            window.location.href = "/"
        }, 300);
    }
     
})