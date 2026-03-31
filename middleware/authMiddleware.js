const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET  ;

//verifica si el usuario esta logueado (soporta sesiones y jwt)
function requireAuth(req, res, next) {
    // Primero verificamos si hay una sesión activa
    if (req.session && req.session.userId) {
        return next();
    }

    //si no hay sesión, si manda jwt en el header
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Guardamos los datos del usuario en req.user
            return next();
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido' });
        }
    }

    //No tiene ni sesión ni token
    res.redirect('/login');
}

module.exports = { requireAuth }; // exportamos la función para usarla en las rutas protegidas