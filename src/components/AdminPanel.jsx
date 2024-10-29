// src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Trash2, Key, LogOut, Users } from 'lucide-react';

const AdminPanel = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError('Error al cargar usuarios');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSuccess('Usuario eliminado exitosamente');
          fetchUsers();
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError('Error al eliminar usuario');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Contraseña actualizada exitosamente');
        setSelectedUser(null);
        setNewPassword('');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Error al actualizar contraseña');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users size={24} />
            Panel de Administración
          </CardTitle>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <AlertDescription className="text-green-600">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'teacher'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' 
                          : user.role === 'teacher' ? 'Docente' 
                          : 'Estudiante'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role !== 'admin' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Cambiar contraseña"
                          >
                            <Key size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>
                    Cambiar Contraseña - {selectedUser.username}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null);
                          setNewPassword('');
                        }}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
