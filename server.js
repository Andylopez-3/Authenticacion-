const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csrf = require('csurf');
const path = require('path');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Configuración de seguridad
app.use(helmet());

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
    secret: process.env.SESSION_SECRET || 'hello word' ,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Cambiar a true si usas HTTPS
        maxAge: 1000 * 60 * 60 // 1 hora
    }
}));

// Protección CSRF
app.use(csrf({ cookie: false }));

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

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});