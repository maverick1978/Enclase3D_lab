import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle, Book, Users, Layout, Video, FileText, ChevronDown, ChevronUp, UserPlus, X } from 'lucide-react';

const TeacherDashboard = ({ teacherId }) => {
  const [courses, setCourses] = useState([]);
  const [showNewCourseForm, setShowNewCourseForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
  });

  // Cargar cursos del profesor
  useEffect(() => {
    fetchTeacherCourses();
  }, [teacherId]);

  const fetchTeacherCourses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/teachers/${teacherId}/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  // Crear nuevo curso
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCourse,
          teacher_id: teacherId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        fetchTeacherCourses();
        setShowNewCourseForm(false);
        setNewCourse({
          title: '',
          description: '',
          subject: '',
          gradeLevel: '',
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  // Agregar módulo
  const handleAddModule = async (courseId) => {
    try {
      const response = await fetch('http://localhost:5000/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: courseId,
          title: 'Nuevo Módulo',
          description: '',
          order_index: courses.find(c => c.id === courseId)?.modules?.length || 0,
        }),
      });
      if (response.ok) {
        fetchTeacherCourses();
      }
    } catch (error) {
      console.error('Error adding module:', error);
    }
  };

  // Cargar estudiantes del curso
  const handleLoadStudents = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/students`);
      const data = await response.json();
      setSelectedCourseStudents(data);
      setShowStudentModal(true);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  // Buscar estudiantes para matricular
  const handleSearchStudents = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/students?name=${query}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching students:', error);
    }
  };

  // Matricular estudiante
  const handleEnrollStudent = async (courseId, studentId) => {
    try {
      const response = await fetch('http://localhost:5000/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: courseId,
          student_id: studentId,
        }),
      });
      if (response.ok) {
        handleLoadStudents(courseId);
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
    }
  };

  // Eliminar estudiante de un curso
  const handleUnenrollStudent = async (courseId, studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/enrollments/${courseId}/${studentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        handleLoadStudents(courseId);
      }
    } catch (error) {
      console.error('Error unenrolling student:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel del Docente</h1>
        <button
          onClick={() => setShowNewCourseForm(!showNewCourseForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          Crear Curso
        </button>
      </div>

      {/* Formulario de nuevo curso */}
      {showNewCourseForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Crear Nuevo Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título del Curso</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Materia</label>
                  <input
                    type="text"
                    value={newCourse.subject}
                    onChange={(e) => setNewCourse({...newCourse, subject: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Grado</label>
                  <input
                    type="text"
                    value={newCourse.gradeLevel}
                    onChange={(e) => setNewCourse({...newCourse, gradeLevel: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCourseForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Crear Curso
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de cursos */}
      <div className="grid grid-cols-1 gap-6">
        {courses.map(course => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="cursor-pointer" onClick={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <CardTitle>{course.title}</CardTitle>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadStudents(course.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Users size={16} />
                      </button>
                      {selectedCourse === course.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{course.subject} - {course.grade_level}</p>
                </div>
              </div>
            </CardHeader>
            {selectedCourse === course.id && (
              <CardContent>
                <p className="mb-4">{course.description}</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Módulos</h3>
                    <button
                      onClick={() => handleAddModule(course.id)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <PlusCircle size={16} />
                      Añadir Módulo
                    </button>
                  </div>
                  {course.modules?.map(module => (
                    <div key={module.id} className="p-4 border rounded">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{module.title}</h4>
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Video size={16} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <FileText size={16} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Layout size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Modal de estudiantes */}
      {showStudentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Estudiantes del Curso</h2>
              <button
                onClick={() => setShowStudentModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => {
                  setSearchStudent(e.target.value);
                  handleSearchStudents(e.target.value);
                }}
                placeholder="Buscar estudiante..."
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Grado</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCourseStudents.map(student => (
                    <tr key={student.id} className="border-b">
                      <td className="p-2">{student.name}</td>
                      <td className="p-2">{student.grade}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleUnenrollStudent(selectedCourse, student.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {searchResults.map(student => (
                    <tr key={student.id} className="border-b">
                      <td className="p-2">{student.name}</td>
                      <td className="p-2">{student.grade}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleEnrollStudent(selectedCourse, student.id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Matricular
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;