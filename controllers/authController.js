const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET ||  'hello word' ;
const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;

//Endpoint get para mostrar formulario de registro
async function showRegister(req, res) {
    res.render('register' , { error : null , csrfToken : req.csrfToken() });

}

//Endpoint post para registrar usuario
async function register(req, res) {
    try {
        const { email, password } = req.body;

        // validamos que haya email y password
        if (!email || !password) {
            return res.render('register', { error: 'Email y contraseña son requeridos', csrfToken: req.csrfToken() });
        }

        // hasheamos la contrasenha 
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        await userModel.createUser(email, hashedPassword);

        res.redirect('/login');
    } catch (err) {
        // si el email ya existe, mostramos error
        if (err.code === '23505') { // error de clave duplicada en postgres
            return res.render('register', { error: 'El email ya está registrado', csrfToken: req.csrfToken() });
        }
        console.error(err);
        res.render('resgister', { error: 'Error al resgistrarse', csrfToken: req.csrfToken() });
    }
}

//endpoint get para mostrar formulario de login
async function showLogin(req, res) {
    res.render('login', { error: null, csrfToken: req.csrfToken() });
}

//Endpoint POST para login de usuario
async function login(req , res) {
    try {
        const { email, password , usejwt } = req.body;

        const user = await userModel.findByEmail(email);

        //Usuario no existe
        if (!user) {
            return res.render('login', { error: 'Credenciales inválidas', csrfToken: req.csrfToken() });
        }

        //verificar si la cuenta esta bloqueada
        if (user.locked_until && new Date() < user.locked_until) {
            const minutes =Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
            return res.render('login' , {
                error : `Cuenta bloqueada. Intenta en ${minutes} minuto(s)`,
                csrfToken : req.csrfToken()
            });
            }

            //verificar contraseña
            const password0k = await bcrypt.compare(password, user.password);

        if (!password0k) {
            await userModel.incrementFailedAttempts(email);

            //bloquear cuenta si supera intentos fallidos
            if (user.failed_attempts + 1 >= MAX_FAILED_ATTEMPTS) {
                await userModel.lockAccount(email);
                return res.render('login', 
                    { error: 'Cuenta bloqueada por demasiados intentos fallidos. Intenta en 15 minutos',
                    csrfToken: req.csrfToken() 
                });
            }

            return res.render('login', {error: 'Credenciales inválidas', csrfToken: req.csrfToken() });
        }

        // login exitoso, reseteamos intentos fallidos
        await userModel.resetFailedAttempts(email);

        // El usuario eligio JWT o cookies de sesión
        if (usejwt === 'true') {
            //generar jwt
            const token = jwt.sign(
                { id: user.id, email: user.email , role: user.role},
                JWT_SECRET,
                { expiresIn: '1h'}
            );   
            return res.render('dashboard', { user, token, useJwt: true});
        } else {
            //guardar datos en sesión
            req.session.userId = user.id;
            req.session.role = user.role;
            req.session.email = user.email;
            return res.redirect('/dashboard');
        }
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Error al iniciar sesión', csrfToken: req.csrfToken() });
    }
}

// post / logout para cerrar sesión
function logout(req, res) {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/login');     
    });
}

//get /dashboard para mostrar dashboard del usuario
async function dashboard(req, res) {
    const userId = req.session?.userId || req.user?.id;
    const user = await userModel.findById(userId);
    res.render('dashboard', { user, token: null, useJwt: false });
}

//get /admin para mostrar panel de admin (solo admin)
async function adminPanel(req, res) {
    const users = await userModel.getAllUsers();
    res.render('admin', { users, csrfToken: req.csrfToken() });
}

//POST /admin/delete/:id para eliminar usuario (solo admin)
async function deleteUser(req, res) {
    await userModel.deleteUser(req.params.id);
    res.redirect('/admin');
    
}

module.exports = {
    showRegister,
    register,
    showLogin ,
    login,
    logout,
    dashboard,
    adminPanel,
    deleteUser
};