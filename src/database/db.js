// src/database/db.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./src/database/education.db', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

db.serialize(() => {
  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insertar usuario administrador por defecto
  const insertAdmin = db.prepare(`INSERT OR IGNORE INTO users 
    (firstName, lastName, email, username, password, role) 
    VALUES (?, ?, ?, ?, ?, ?)`);
  
  insertAdmin.run(
    'Admin',
    'System',
    'admin@system.com',
    'admin',
    '123456',
    'admin'
  );
  insertAdmin.finalize();
});

module.exports = db;
