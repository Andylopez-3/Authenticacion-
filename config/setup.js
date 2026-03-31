const {Client} = require('pg');
require('dotenv').config();

async function setup() {
    const client = new Client({
    user: process.env.DB_USER  ,
    host: process.env.DB_HOST ,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD ,
    port: process.env.DB_PORT ,
    });     

    await client.connect();
    await client.query('CREATE DATABASE passport_inc').catch(()  => {
    console.log('La base de datos ya existe  ');
    });
    await client.end();

    const pool = require('./database');

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL , 
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            failed_attempts INTEGER DEFAULT 0,
            lock_until TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
            sid VARCHAR(255) PRIMARY KEY,
            sess JSON NOT NULL,
            expire TIMESTAMP NOT NULL
        )
    `);

    console.log('Base de datos y tablas creadas correctamente');
    process.exit(0);
}

setup().catch(err => {
    console.error('Error al configurar la base de datos:', err);
    process.exit(1);
});
