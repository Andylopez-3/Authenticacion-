const pool = require('../config/database');

// Crear usuario nuevo
async function createUser(email, hashedPassword) {
    const result = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
    [email, hashedPassword]
    );
    return result.rows[0];
}

// Buscar usuario por email
async function findByEmail(email) {
    const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
    );
    return result.rows[0];
}

// Buscar usuario por ID
async function findById(id) {
    const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
    );
    return result.rows[0];
}

// Registrar intento fallido de login
async function incrementFailedAttempts(email) {
    await pool.query(
    'UPDATE users SET failed_attempts = failed_attempts + 1 WHERE email = $1',
    [email]
    );
}

// Bloquear cuenta por 15 minutos
async function lockAccount(email) {
  const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await pool.query(
    'UPDATE users SET locked_until = $1 WHERE email = $2',
    [lockedUntil, email]
    );
}

// Resetear intentos fallidos al loguearse bien
async function resetFailedAttempts(email) {
    await pool.query(
    'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE email = $1',
    [email]
    );
}

// Ver todos los usuarios (solo admin)
async function getAllUsers() {
    const result = await pool.query(
    'SELECT id, email, role, failed_attempts, locked_until, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
}

// Eliminar usuario (solo admin)
async function deleteUser(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = {  //exportamos las funciones para usarlas en los controladores
    createUser,
    findByEmail,
    findById,
    incrementFailedAttempts,
    lockAccount,
    resetFailedAttempts,
    getAllUsers,
    deleteUser,
};