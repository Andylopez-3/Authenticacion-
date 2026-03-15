const userModel = require('../controllers/usermodel');

//solo permite pasar si el usuario es admin
function requireAdmin(req, res, next) {
    const role = req.session?.role || req.user?.role;

    if (role === 'admin') {
        return next();
    }

    res.status(403).json({ message: 'Acceso denegado: se requiere rol de admin' });
}

module.exports = { requireAdmin };