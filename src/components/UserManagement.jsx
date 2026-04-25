import { useState, useEffect } from 'react';
import {
  Users, Trash2, UserCheck, UserX, Shield, GraduationCap, Plus, Search, Edit2, Loader2, Heart
} from 'lucide-react';
import { fetchUsers, saveUserAPI, updateUserStatusAPI, deleteUserAPI } from '../services/api';

const roleLabel = { admin: 'Administrador', coordinator: 'Coordinador', welfare: 'Bienestar', tutor: 'Tutor', student: 'Estudiante' };
const roleIcon = { admin: Shield, coordinator: Shield, welfare: Heart, tutor: GraduationCap, student: Users };

export default function UserManagement({ onUpdate }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'tutor', department: '', password: '' });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setStaff(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateUserStatusAPI(id, newStatus);
      setStaff(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('¿Estás seguro de desactivar permanentemente a este usuario?')) return;
    try {
      await deleteUserAPI(id);
      setStaff(prev => prev.map(s => s.id === id ? { ...s, status: 'inactive' } : s));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      password: '' // No mostramos la contraseña actual por seguridad
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.department || (!editingId && !form.password)) {
      setFormError('Todos los campos son obligatorios (incluyendo contraseña para nuevos usuarios).');
      return;
    }
    
    try {
      const savedUser = await saveUserAPI(form, editingId);
      if (editingId) {
        setStaff(prev => prev.map(u => u.id === editingId ? savedUser : u));
      } else {
        setStaff(prev => [...prev, savedUser]);
      }
      
      setForm({ name: '', email: '', role: 'tutor', department: '', password: '' });
      setEditingId(null);
      setFormError('');
      setShowForm(false);
      if (onUpdate) onUpdate(savedUser);
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <div className="animate-fade-in" id="user-management">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Administración de Usuarios</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona el personal docente y coordinadores del sistema</p>
        </div>
        <button
          id="add-user-btn"
          onClick={() => setShowForm(v => !v)}
          className="btn-primary !w-auto !py-2.5 !px-5 text-sm"
        >
          <Plus size={16} /> Agregar usuario
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-5 mb-5 animate-slide-up border-uceva-800/40">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            {editingId ? <Edit2 size={16} className="text-uceva-400" /> : <Plus size={16} className="text-uceva-400" />}
            {editingId ? 'Editar usuario' : 'Registrar nuevo usuario'}
          </h3>
          {formError && <p className="text-red-400 text-xs mb-3 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input className="input-field" placeholder="Nombre completo" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            <input className="input-field" placeholder="Correo institucional" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            <select className="input-field" value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
              <option value="tutor">Tutor</option>
              <option value="student">Estudiante</option>
              <option value="coordinator">Coordinador</option>
              <option value="welfare">Bienestar</option>
              <option value="admin">Administrador</option>
            </select>
            <input className="input-field" placeholder="Departamento / Facultad" value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))} />
            <input 
              type="password" 
              className="input-field" 
              placeholder={editingId ? "Nueva contraseña (dejar en blanco para mantener)" : "Contraseña"} 
              value={form.password} 
              onChange={e => setForm(f => ({...f, password: e.target.value}))} 
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary !w-auto !py-2 !px-5 text-sm">
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormError(''); }} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          id="staff-search"
          type="text"
          placeholder="Buscar por nombre, correo o departamento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <Loader2 size={32} className="text-uceva-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando usuarios del sistema...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" id="staff-table">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wide">Rol</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wide hidden md:table-cell">Departamento</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Correo</th>
                <th className="text-left px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wide">Estado</th>
                <th className="text-right px-5 py-3.5 text-gray-500 font-medium text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member, i) => {
                const Icon = roleIcon[member.role] || Users;
                return (
                  <tr key={member.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-900/30'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-uceva-800 to-uceva-950 flex items-center justify-center text-uceva-300">
                          <Icon size={14} />
                        </div>
                        <span className="text-gray-200 font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${member.role === 'coordinator' ? 'bg-purple-900/40 text-purple-300 border border-purple-800/40' : 'bg-blue-900/40 text-blue-300 border border-blue-800/40'}`}>
                        {roleLabel[member.role]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">{member.department}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell text-xs">{member.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${member.status === 'active' ? 'bg-uceva-900/40 text-uceva-300 border border-uceva-800/40' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}>
                        {member.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(member)}
                          title="Editar"
                          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit2 size={15}/>
                        </button>
                        <button
                          onClick={() => toggleStatus(member.id, member.status)}
                          title={member.status === 'active' ? 'Desactivar' : 'Activar'}
                          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-uceva-300 transition-colors"
                        >
                          {member.status === 'active' ? <UserX size={15}/> : <UserCheck size={15}/>}
                        </button>
                        <button
                          onClick={() => deleteUser(member.id)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-600 text-sm">
                    No se encontraron usuarios con esos criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
