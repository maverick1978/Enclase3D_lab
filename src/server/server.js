// src/server/server.js
const express = require('express');
const cors = require('cors');
const db = require('../database/db');

const app = express();
app.use(cors());
app.use(express.json());

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(
    'SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?',
    [username, username, password],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: 'Error en el servidor' });
        return;
      }
      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json({ 
          success: true, 
          message: 'Login exitoso',
          user: userWithoutPassword
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Credenciales incorrectas' 
        });
      }
    }
  );
});

// Registro
app.post('/api/register', (req, res) => {
  const { firstName, lastName, email, username, password, role } = req.body;
  
  if (role === 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'No se puede registrar un usuario administrador' 
    });
  }

  db.run(
    `INSERT INTO users (firstName, lastName, email, username, password, role) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [firstName, lastName, email, username, password, role],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ 
            success: false, 
            message: 'El email o nombre de usuario ya existe' 
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: 'Error al registrar usuario' 
          });
        }
        return;
      }
      res.json({ 
        success: true, 
        message: 'Usuario registrado exitosamente' 
      });
    }
  );
});

// Rutas de administración (protegidas)
app.get('/api/users', (req, res) => {
  db.all('SELECT id, firstName, lastName, email, username, role FROM users', (err, users) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener usuarios' });
      return;
    }
    res.json(users);
  });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM users WHERE id = ? AND role != "admin"', id, function(err) {
    if (err) {
      res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado o es administrador' });
      return;
    }
    res.json({ success: true, message: 'Usuario eliminado exitosamente' });
  });
});

app.put('/api/users/:id/password', (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  
  db.run(
    'UPDATE users SET password = ? WHERE id = ?',
    [password, id],
    function(err) {
      if (err) {
        res.status(500).json({ success: false, message: 'Error al actualizar contraseña' });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }
      res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    }
  );
});

// Rutas para gestión de cursos
app.post('/api/courses', async (req, res) => {
  const { teacher_id, title, description, subject, grade_level } = req.body;
  
  db.run(
    'INSERT INTO courses (teacher_id, title, description, subject, grade_level) VALUES (?, ?, ?, ?, ?)',
    [teacher_id, title, description, subject, grade_level],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Curso creado exitosamente' });
    }
  );
});

app.get('/api/teachers/:teacherId/courses', (req, res) => {
  const teacherId = req.params.teacherId;
  
  db.all(
    'SELECT * FROM courses WHERE teacher_id = ? ORDER BY created_at DESC',
    [teacherId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Rutas para gestión de módulos
app.post('/api/modules', (req, res) => {
  const { course_id, title, description, order_index } = req.body;
  
  db.run(
    'INSERT INTO modules (course_id, title, description, order_index) VALUES (?, ?, ?, ?)',
    [course_id, title, description, order_index],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Módulo creado exitosamente' });
    }
  );
});

// Rutas para gestión de estudiantes y matrículas
app.post('/api/enrollments', (req, res) => {
  const { course_id, student_id } = req.body;
  
  db.run(
    'INSERT INTO course_enrollments (course_id, student_id) VALUES (?, ?)',
    [course_id, student_id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(400).json({ error: 'Estudiante ya matriculado en este curso' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      res.json({ id: this.lastID, message: 'Estudiante matriculado exitosamente' });
    }
  );
});

app.get('/api/courses/:courseId/students', (req, res) => {
  const courseId = req.params.courseId;
  
  db.all(
    `SELECT s.* FROM students s
     JOIN course_enrollments ce ON s.id = ce.student_id
     WHERE ce.course_id = ? AND ce.status = 'active'
     ORDER BY s.name`,
    [courseId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});