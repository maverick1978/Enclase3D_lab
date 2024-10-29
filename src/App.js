// src/App.js
import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowRegister(false);
  };

  if (currentUser) {
    if (currentUser.role === 'admin') {
      return <AdminPanel onLogout={handleLogout} />;
    }
    // Aquí puedes agregar más paneles según el rol (estudiante/docente)
    return (
      <div className="p-4">
        <h1>Bienvenido, {currentUser.firstName}!</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        {showRegister ? (
          <RegisterForm onBackToLogin={() => setShowRegister(false)} />
        ) : (
          <LoginForm
            onRegisterClick={() => setShowRegister(true)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default App;