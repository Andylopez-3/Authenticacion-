const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csrf = require('csurf');
const path = require('path');
require('dotenv').config();
const pgSession = require('connect-pg-simple')(session);

const authRoutes = require('./routes/authRoutes');
const pool = require('./config/database');

const app = express();

// Configuración de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'"], // Permitir scripts del mismo origen y scripts en línea
    }
}

}));

// parsear body y cookies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración de sesiones
app.use(session({
    store : new pgSession({
        pool : pool,                // Conexión a la base de datos
        tableName : 'sessions' // Nombre de la tabla para almacenar sesiones
    }),
    secret: process.env.SESSION_SECRET  , // token de sesión seguro
    resave: false,   // No guardar la sesión si no ha cambiado
    saveUninitialized: false, // No guardar sesiones vacías , sin iniciar sesión
    cookie: { 
        httpOnly: true,  // Evita que el cookie sea accesible desde JavaScript
        secure: false, // Cambiar a true si usas HTTPS , false por que estamos en desarrollo ,localhost
        maxAge: 1000 * 60 * 60 // 1 hora
    }
}));

// Protección CSRF
app.use((req, res, next) => {
    if (req.path === '/logout') return next(); // Excluir logout de la protección CSRF
    csrf({ cookie: false })(req, res, next);
});

// Limitador de tasa para prevenir ataques de fuerza bruta
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // Limitar a 20 intentos por IP
    message: 'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo en 15 minutos.'
});
app.use('/login', loginLimiter);

// Rutas
app.use('/', authRoutes);

app.get('/', (req, res) => res.redirect('/login'));

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.redirect('/login');
    }
    next(err);
});


// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});