async function loadUser(){
    try{
        const req = await fetch("/api/auth", {credentials: "include"}) // manda cookies
 

        if(req.status !== 202){
            // intentar refresh de cookie
            const refreshReq = await fetch("/api/refresh", {method: "POST", credentials: "include"}) // manda cookies

            if(refreshReq.status !== 202){
                console.log("Sesión expirada, redirigiendo a login...");
                window.location.href = "/login"; 
                return null
            }

            return loadUser();
        }

        const data = await req.json()
        return data
 
    }catch(err){
        console.error("Error obteniendo usuario:", err);
        return null;
    }
}

loadUser().then(cookie => console.log(cookie))