🛂 PassPort Inc. - Sistema de Autenticación Seguro
Sistema de autenticación y gestión de sesiones implementado con Node.js, Express, PostgreSQL y arquitectura MVC. Desarrollado como parte de un desafío de seguridad web enfocado en buenas prácticas de autenticación y autorización.

🎯 ¿Qué hace este proyecto?
PassPort Inc. es una plataforma donde los usuarios pueden registrarse, iniciar sesión y gestionar su identidad digital de forma segura. El sistema implementa dos métodos de autenticación, control de acceso por roles y múltiples capas de protección contra ataques comunes.

🚀 Tecnologías utilizadas
Node.js — Entorno de ejecución
Express — Framework web
EJS — Motor de plantillas
PostgreSQL — Base de datos relacional
bcrypt — Hashing de contraseñas
express-session + connect-pg-simple — Sesiones persistentes con cookies
jsonwebtoken (JWT) — Autenticación sin estado
csurf — Protección contra CSRF
helmet — Cabeceras de seguridad HTTP
express-rate-limit — Limitación de intentos de login
dotenv — Variables de entorno
📁 Estructura del proyecto
passport-inc/
├── config/
│   ├── database.js         # Conexión a PostgreSQL
│   └── setup.js            # Creación de tablas
├── controllers/
│   └── authController.js   # Lógica de autenticación
├── middleware/
│   ├── authMiddleware.js   # Verificación de sesión/JWT
│   └── roleMiddleware.js   # Control de acceso por roles
├── models/
│   └── userModel.js        # Queries SQL de usuarios
├── routes/
│   └── authRoutes.js       # Definición de rutas
├── views/
│   ├── register.ejs        # Vista de registro
│   ├── login.ejs           # Vista de login
│   ├── dashboard.ejs       # Vista principal del usuario
│   └── admin.ejs           # Panel de administración
├── public/
│   └── css/styles.css      # Estilos
├── .env                    # Variables de entorno (no se sube a GitHub)
├── server.js               # Servidor principal
└── package.json
⚙️ Instalación y configuración
1. Clonar el repositorio
bash
git clone https://github.com/Andylopez-3/Authenticacion-.git
cd Authenticacion-
2. Instalar dependencias
bash
npm install
3. Configurar variables de entorno
Crear un archivo .env en la raíz del proyecto:

env
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_NAME=passport_inc
DB_PORT=5432

JWT_SECRET=tu_clave_secreta_jwt
SESSION_SECRET=tu_clave_secreta_session
4. Crear la base de datos y tablas
bash
npm run setup
5. Ejecutar el servidor
bash
npm start
6. Abrir en el navegador
http://localhost:3000
🗄️ Estructura de la base de datos
Tabla: users
sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Tabla: sessions
sql
CREATE TABLE sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);
🔐 Funcionalidades de seguridad
Autenticación
Registro e inicio de sesión con email y contraseña
Contraseñas hasheadas con bcrypt (10 salt rounds)
Elección entre sesión con cookie o autenticación con JWT
Sesiones con Cookie
Sesiones persistentes almacenadas en PostgreSQL
Cookie con flags HttpOnly y Secure
Destrucción completa de sesión al cerrar sesión
JWT (JSON Web Token)
Token generado con datos del usuario al iniciar sesión
Verificación en cada request mediante header Authorization y cookie
Expiración de 1 hora
Control de acceso por roles (RBAC)
Usuario — acceso al dashboard personal
Administrador — acceso al panel de administración, ver y eliminar usuarios
Protección contra ataques
XSS — Helmet configura cabeceras de seguridad automáticamente
CSRF — Token único en cada formulario verificado por el servidor
Fuerza bruta — Bloqueo de cuenta tras 5 intentos fallidos (15 minutos) + Rate limiting por IP (20 requests / 15 minutos)
📡 Endpoints
Autenticación
Método	Ruta	Descripción
GET	/register	Formulario de registro
POST	/register	Crear nueva cuenta
GET	/login	Formulario de login
POST	/login	Iniciar sesión
POST	/logout	Cerrar sesión
Usuario autenticado
Método	Ruta	Descripción
GET	/dashboard	Panel principal del usuario
Administrador
Método	Ruta	Descripción
GET	/admin	Panel de administración
POST	/admin/delete/:id	Eliminar usuario
👤 Crear un administrador
Después de registrarte, ejecutar en pgAdmin o psql:

sql
UPDATE users SET role = 'admin' WHERE email = 'tuemail@ejemplo.com';
🏗️ Arquitectura MVC
Modelo (models/userModel.js)
Queries SQL con pg (node-postgres) para todas las operaciones de usuarios.

Vista (views/)
Plantillas EJS que renderizan los datos del servidor.

Controlador (controllers/authController.js)
Recibe los requests HTTP, ejecuta la lógica de negocio y coordina modelo y vista.

Middleware
authMiddleware.js — verifica si el usuario está autenticado (sesión o JWT)
roleMiddleware.js — verifica si el usuario tiene el rol requerido
🎓 Conceptos aplicados
Hashing con bcrypt y salt rounds
Sesiones persistentes con cookies HttpOnly
JWT para autenticación sin estado
RBAC (Role Based Access Control)
CSRF protection con tokens únicos
XSS protection con Helmet
Brute force prevention con rate limiting y bloqueo de cuenta
Variables de entorno para datos sensibles
Async/Await para operaciones asíncronas
Prepared Statements para prevenir SQL Injection

Autor : Óscar López