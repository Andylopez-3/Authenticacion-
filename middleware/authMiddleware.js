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
    const cookieToken = req.cookies['jwt_token'];
    const token = authHeader ? authHeader.split(' ')[1] : cookieToken;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Guardamos los datos del usuario en req.user
            return next();
        } catch (err) {
            return res.redirect('/login'); // Token inválido o expirado, redirigimos a login
        }
    }

    //No tiene ni sesión ni token
    res.redirect('/login');
}

module.exports = { requireAuth }; // exportamos la función para usarla en las rutas protegidas