const user = document.getElementById("user")
const email = document.getElementById("email")
const password = document.getElementById("password")
const entrar = document.getElementById("entrar")

const errorHolderUser = document.getElementById("ErrorHolderUser")
const errorHolderEmail = document.getElementById("ErrorHolderEmail")
const errorHolderContraseña = document.getElementById("ErrorHolderContraseña")

const login = document.getElementById("IniciaSesion")

login.addEventListener("click", () => {
    window.location.href = "/login"
})

entrar.addEventListener("click", async () =>{
    console.log("aaaaa")
    const userTextBox = user.value
    const emailTextBox = email.value
    const contraTextBox = password.value

    const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"user": userTextBox, "correo": emailTextBox, "contraseña": contraTextBox})
    });

    const data = await response.json();

    if(response.status != 201){
        // Reset de todos antes


        user.style.border = "1px solid #696969";
        user.style.color = "#696969";
        user.classList.remove("input-rojo");
        errorHolderUser.classList.remove("input-rojo");
        errorHolderUser.style.display = "none";


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

        if (data.error == "El correo ya existe") {
            errorHolderEmail.textContent = "Ya existe una cuenta con el correo";
            errorHolderEmail.style.display = "flex";
            email.style.border = "1px solid red";
            email.style.color = "red";
            email.classList.add("input-rojo");
        }

        if (data.error == "Falta user") {
            errorHolderUser.textContent = "Ingrese usuario";
            errorHolderUser.style.display = "flex";
            user.style.border = "1px solid red";
            user.style.color = "red";
            user.classList.add("input-rojo");
        }

        if (data.error == "Falta correo") {
            errorHolderEmail.textContent = "Ingrese correo";
            errorHolderEmail.style.display = "flex";
            email.style.border = "1px solid red";
            email.style.color = "red";
            email.classList.add("input-rojo");
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
        user.style.border = "1px solid #696969";
        user.style.color = "#696969";
        user.classList.remove("input-rojo");
        errorHolderUser.classList.remove("input-rojo");
        errorHolderUser.style.display = "none";


        email.style.border = "1px solid #696969";
        email.style.color = "#696969";
        email.classList.remove("input-rojo");
        errorHolderEmail.style.display = "none";

        password.style.border = "1px solid #696969";
        password.style.color = "#696969";
        password.classList.remove("input-rojo");
        errorHolderContraseña.style.display = "none";

        setTimeout(() => {
            window.location.href = "/login"
        }, 300);
    }

    console.log(data);

     
})