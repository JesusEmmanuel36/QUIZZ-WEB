const jwt = require("jsonwebtoken");

const SECRET = "elcacas27"; // usa el mismo secreto

function authenticateToken(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ error: "No autorizado" });

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded; // aquí guardas el usuario en la request
        next(); // sigue al siguiente middleware o ruta
    } catch (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
}

module.exports = authenticateToken;