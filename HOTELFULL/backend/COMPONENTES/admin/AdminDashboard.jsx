import React, { useState, useEffect } from 'react';
import { supabase } from '../../../cliente/SERVICIOS/supabaseClient.jsx';
import { useNavigate } from 'react-router-dom';
import '../../ESTILOS/DashboardStyles.css';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalHabitaciones: 0,
    habitacionesDisponibles: 0,
    habitacionesOcupadas: 0,
    totalOperadores: 0,
    operadoresActivos: 0,
    totalReservas: 0,
    reservasPendientes: 0,
    reservasConfirmadas: 0,
    ingresoTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [habitaciones, setHabitaciones] = useState([]);
  const [operadores, setOperadores] = useState([]);

  // Estados para modales
  const [showNuevaHabitacion, setShowNuevaHabitacion] = useState(false);
  const [showNuevoOperador, setShowNuevoOperador] = useState(false);
  const [editingHabitacion, setEditingHabitacion] = useState(null);
  const [editingOperador, setEditingOperador] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUser(profileData);

      await loadHabitaciones();
      await loadOperadores();
      await loadReservas();

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const loadHabitaciones = async () => {
    const { data } = await supabase
      .from('habitaciones')
      .select('*')
      .order('numero', { ascending: true });

    setHabitaciones(data || []);

    const disponibles = data?.filter(h => h.estado === 'disponible').length || 0;
    const ocupadas = data?.filter(h => h.estado === 'ocupada').length || 0;

    setStats(prev => ({
      ...prev,
      totalHabitaciones: data?.length || 0,
      habitacionesDisponibles: disponibles,
      habitacionesOcupadas: ocupadas
    }));
  };

  const loadOperadores = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('rol', 'operador')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar operadores:', error);
    }

    setOperadores(data || []);

    const activos = data?.filter(op => op.activo === true).length || 0;

    setStats(prev => ({
      ...prev,
      totalOperadores: data?.length || 0,
      operadoresActivos: activos
    }));
  };

  const loadReservas = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .in('estado', ['pendiente', 'confirmada'])
      .order('fecha_entrada', { ascending: true });

    if (!error) {
      const pendientes = data?.filter(r => r.estado === 'pendiente').length || 0;
      const confirmadas = data?.filter(r => r.estado === 'confirmada').length || 0;
      const ingreso = data?.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0) || 0;

      setStats(prev => ({
        ...prev,
        totalReservas: data?.length || 0,
        reservasPendientes: pendientes,
        reservasConfirmadas: confirmadas,
        ingresoTotal: ingreso
      }));
    } else {
      console.error('Error al cargar reservas:', error);
    }
  };

  const handleToggleHabitacion = async (id, currentEstado) => {
    console.log(' Toggle habitación:', { id, currentEstado });
    // Cambiar entre 'disponible' y 'mantenimiento' (en vez de 'deshabilitada')
    const nuevoEstado = currentEstado === 'disponible' ? 'mantenimiento' : 'disponible';
    console.log(' Nuevo estado:', nuevoEstado);

    const { error, data } = await supabase
      .from('habitaciones')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select();

    if (error) {
      console.error(' Error completo:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      alert('Error al cambiar estado: ' + error.message + '\nDetalles: ' + (error.details || error.hint || 'Sin más información'));
    } else {
      console.log('Actualizado exitosamente:', data);
      await loadHabitaciones();
    }
  };

  const handleToggleOperador = async (id, currentActivo) => {
    console.log(' Toggle operador:', { id, currentActivo });
    // Cambiar entre true (activo) y false (deshabilitado)
    const nuevoActivo = !currentActivo;
    console.log(' Nuevo activo:', nuevoActivo);

    const { error, data } = await supabase
      .from('profiles')
      .update({ activo: nuevoActivo })
      .eq('id', id)
      .select();

    if (error) {
      console.error(' Error al actualizar operador:', error);
      alert('Error al cambiar estado del operador: ' + error.message);
    } else {
      console.log(' Operador actualizado:', data);
      await loadOperadores();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container admin-dashboard">
      {/* Background overlay */}
      <div className="admin-bg-overlay"></div>

      {/* Header */}
      <div className="dashboard-header admin-header">
        <h1>Panel de Administrador - {user?.nombre}</h1>
        <button onClick={handleLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeSection === 'dashboard' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeSection === 'operadores' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('operadores')}
        >
          Operadores
        </button>
        <button
          className={activeSection === 'habitaciones' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('habitaciones')}
        >
          Habitaciones
        </button>
      </div>

      <div className="dashboard-content">
        {/* DASHBOARD PRINCIPAL CON GRÁFICO */}
        {activeSection === 'dashboard' && (
          <>
            {/* Statistics Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <i className="fas fa-hotel"></i>
                <h3>{stats.totalHabitaciones}</h3>
                <p>Total Habitaciones</p>
              </div>

              <div className="stat-card">
                <i className="fas fa-door-open"></i>
                <h3>{stats.habitacionesDisponibles}</h3>
                <p>Disponibles</p>
              </div>

              <div className="stat-card">
                <i className="fas fa-bed"></i>
                <h3>{stats.habitacionesOcupadas}</h3>
                <p>Ocupadas</p>
              </div>

              <div className="stat-card">
                <i className="fas fa-users"></i>
                <h3>{stats.totalOperadores}</h3>
                <p>Total Operadores</p>
              </div>

              <div className="stat-card">
                <i className="fas fa-user-check"></i>
                <h3>{stats.operadoresActivos}</h3>
                <p>Operadores Activos</p>
              </div>
            </div>

            {/* Gráfico de Torta con Recharts */}
            <div className="dashboard-card chart-card">
              <h2>Estado de Habitaciones</h2>
              <div className="pie-chart-simple">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Disponibles', value: stats.habitacionesDisponibles },
                        { name: 'Ocupadas', value: stats.habitacionesOcupadas },
                        { name: 'Mantenimiento', value: stats.totalHabitaciones - stats.habitacionesDisponibles - stats.habitacionesOcupadas }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#28a745" />
                      <Cell fill="#dc3545" />
                      <Cell fill="#ffc107" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Ocupación Semanal */}
            <div className="dashboard-card chart-card">
              <h2>Tendencia de Ocupación Semanal</h2>
              <div className="line-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { dia: 'Lun', ocupadas: stats.habitacionesOcupadas * 0.7, disponibles: stats.habitacionesDisponibles * 1.3 },
                      { dia: 'Mar', ocupadas: stats.habitacionesOcupadas * 0.8, disponibles: stats.habitacionesDisponibles * 1.2 },
                      { dia: 'Mié', ocupadas: stats.habitacionesOcupadas * 0.85, disponibles: stats.habitacionesDisponibles * 1.15 },
                      { dia: 'Jue', ocupadas: stats.habitacionesOcupadas * 0.9, disponibles: stats.habitacionesDisponibles * 1.1 },
                      { dia: 'Vie', ocupadas: stats.habitacionesOcupadas, disponibles: stats.habitacionesDisponibles },
                      { dia: 'Sáb', ocupadas: stats.habitacionesOcupadas * 1.2, disponibles: stats.habitacionesDisponibles * 0.8 },
                      { dia: 'Dom', ocupadas: stats.habitacionesOcupadas * 1.1, disponibles: stats.habitacionesDisponibles * 0.9 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E0" />
                    <XAxis dataKey="dia" stroke="#77878B" />
                    <YAxis stroke="#77878B" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E8E8E0', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="ocupadas" stroke="#F44336" strokeWidth={2} name="Ocupadas" />
                    <Line type="monotone" dataKey="disponibles" stroke="#4CAF50" strokeWidth={2} name="Disponibles" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Ingresos Mensuales */}
            <div className="dashboard-card chart-card">
              <h2>Proyección de Ingresos Mensuales</h2>
              <div className="line-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { mes: 'Ene', ingresos: stats.ingresoTotal * 0.7 },
                      { mes: 'Feb', ingresos: stats.ingresoTotal * 0.75 },
                      { mes: 'Mar', ingresos: stats.ingresoTotal * 0.85 },
                      { mes: 'Abr', ingresos: stats.ingresoTotal * 0.9 },
                      { mes: 'May', ingresos: stats.ingresoTotal },
                      { mes: 'Jun', ingresos: stats.ingresoTotal * 1.1 },
                      { mes: 'Jul', ingresos: stats.ingresoTotal * 1.3 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E0" />
                    <XAxis dataKey="mes" stroke="#77878B" />
                    <YAxis stroke="#77878B" />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E8E8E0', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="ingresos" stroke="#F4B860" strokeWidth={3} name="Ingresos ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* SECCIÓN OPERADORES */}
        {activeSection === 'operadores' && (
          <div className="dashboard-card">
            <div className="section-header">
              <h2>Gestión de Operadores</h2>
              <button className="btn-primary" onClick={() => setShowNuevoOperador(true)}>
                + Nuevo Operador
              </button>
            </div>

            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {operadores.map(op => (
                    <tr key={op.id}>
                      <td><strong>{op.nombre}</strong></td>
                      <td>{op.telefono || 'N/A'}</td>
                      <td>
                        <span className={`badge ${op.activo ? 'badge-confirmada' : 'badge-cancelada'}`}>
                          {op.activo ? 'Activo' : 'Deshabilitado'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-action"
                          onClick={() => setEditingOperador(op)}
                        >
                          Editar
                        </button>
                        <button
                          className={op.activo ? "btn-danger" : "btn-success"}
                          onClick={() => handleToggleOperador(op.id, op.activo)}
                        >
                          {op.activo ? 'Deshabilitar' : 'Habilitar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECCIÓN HABITACIONES */}
        {activeSection === 'habitaciones' && (
          <div className="dashboard-card">
            <div className="section-header">
              <h2>Gestión de Habitaciones</h2>
              <button className="btn-primary" onClick={() => setShowNuevaHabitacion(true)}>
                + Nueva Habitación
              </button>
            </div>

            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Capacidad</th>
                    <th>Precio/Noche</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {habitaciones.map(hab => (
                    <tr key={hab.id}>
                      <td><strong>{hab.numero}</strong></td>
                      <td>{hab.tipo}</td>
                      <td>{hab.capacidad} personas</td>
                      <td>${hab.precio_por_noche}/noche</td>
                      <td>
                        <span className={`badge ${hab.estado === 'disponible' ? 'badge-confirmada' : hab.estado === 'mantenimiento' ? 'badge-cancelada' : 'badge-pendiente'}`}>
                          {hab.estado === 'mantenimiento' ? 'Deshabilitada' : hab.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-action"
                          onClick={() => setEditingHabitacion(hab)}
                        >
                          Editar
                        </button>
                        {(hab.estado === 'disponible' || hab.estado === 'mantenimiento') && (
                          <button
                            className={hab.estado === 'mantenimiento' ? "btn-success" : "btn-danger"}
                            onClick={() => handleToggleHabitacion(hab.id, hab.estado)}
                          >
                            {hab.estado === 'mantenimiento' ? 'Habilitar' : 'Deshabilitar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {showNuevaHabitacion && (
        <ModalHabitacion
          onClose={() => setShowNuevaHabitacion(false)}
          onSuccess={() => {
            setShowNuevaHabitacion(false);
            loadHabitaciones();
          }}
        />
      )}

      {editingHabitacion && (
        <ModalHabitacion
          habitacion={editingHabitacion}
          onClose={() => setEditingHabitacion(null)}
          onSuccess={() => {
            setEditingHabitacion(null);
            loadHabitaciones();
          }}
        />
      )}

      {showNuevoOperador && (
        <ModalOperador
          onClose={() => setShowNuevoOperador(false)}
          onSuccess={() => {
            setShowNuevoOperador(false);
            loadOperadores();
          }}
        />
      )}

      {editingOperador && (
        <ModalOperador
          operador={editingOperador}
          onClose={() => setEditingOperador(null)}
          onSuccess={() => {
            setEditingOperador(null);
            loadOperadores();
          }}
        />
      )}
    </div>
  );
}

// MODAL HABITACIÓN
function ModalHabitacion({ onClose, onSuccess, habitacion }) {
  const [formData, setFormData] = useState({
    numero: habitacion?.numero || '',
    tipo: habitacion?.tipo || 'Simple',
    capacidad: habitacion?.capacidad || 1,
    precio_por_noche: habitacion?.precio_por_noche || '',
    descripcion: habitacion?.descripcion || ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Por favor selecciona solo archivos de imagen');
      return;
    }
    setImageFiles(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadedUrls = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `habitaciones/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imagenes')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error al subir imagen:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('imagenes')
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const imageUrls = imageFiles.length > 0 ? await uploadImages() : [];
      const dataToSave = {
        ...formData,
        ...(imageUrls.length > 0 && { imagenes: imageUrls })
      };

      if (habitacion) {
        // Editar
        const { error } = await supabase
          .from('habitaciones')
          .update(dataToSave)
          .eq('id', habitacion.id);

        if (error) throw error;
        alert('Habitación actualizada exitosamente!');
      } else {
        // Crear
        const { error } = await supabase
          .from('habitaciones')
          .insert([{ ...dataToSave, estado: 'disponible' }]);

        if (error) throw error;
        alert('Habitación creada exitosamente!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{habitacion ? 'Editar Habitación' : 'Nueva Habitación'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Número de Habitación</label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({...formData, numero: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
            >
              <option>Simple</option>
              <option>Doble</option>
              <option>Suite</option>
              <option>Presidencial</option>
            </select>
          </div>

          <div className="form-group">
            <label>Capacidad</label>
            <input
              type="number"
              value={formData.capacidad}
              onChange={(e) => setFormData({...formData, capacidad: parseInt(e.target.value)})}
              required
            />
          </div>

          <div className="form-group">
            <label>Precio por Noche</label>
            <input
              type="number"
              value={formData.precio_por_noche}
              onChange={(e) => setFormData({...formData, precio_por_noche: parseFloat(e.target.value)})}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows="3"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Imágenes</label>
            <div
              className={`image-upload-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div className="upload-icon">📸</div>
              <p className="upload-text">
                Arrastra imágenes aquí o haz clic
              </p>
            </div>

            {imageFiles.length > 0 && (
              <div className="image-preview-grid">
                {imageFiles.map((file, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Guardando...' : habitacion ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// MODAL OPERADOR
function ModalOperador({ onClose, onSuccess, operador }) {
  const [formData, setFormData] = useState({
  nombre: operador?.nombre || '',
  email: operador?.email || '',
  telefono: operador?.telefono || '',
  password: ''
});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (operador) {
        // Editar operador existente
        const updateData = {
          nombre: formData.nombre,
          telefono: formData.telefono
        };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', operador.id);

        if (error) throw error;
        alert('Operador actualizado exitosamente!');
      } else {
        // Crear nuevo operador
        if (!formData.password) {
          alert('La contraseña es obligatoria para crear un operador');
          setLoading(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      nombre: formData.nombre,
      telefono: formData.telefono,
      rol: 'operador'
    }
  }
});

        if (authError) {
          console.error('Error en signUp:', authError);
          if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            alert('Error: Este email ya está registrado. Por favor usa otro email.');
          } else {
            alert('Error al crear operador: ' + authError.message);
          }
          setLoading(false);
          return;
        }

        if (authData.user) {
          // Primero verificar si el profile ya existe
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .single();

          if (existingProfile) {
            // Si ya existe, actualizarlo
           const { error: updateError } = await supabase
  .from('profiles')
  .update({
    nombre: formData.nombre,
    email: formData.email,  // ✅ Ahora SÍ agrégalo
    telefono: formData.telefono,
    rol: 'operador',
    activo: true
  })
  .eq('id', authData.user.id);

            if (updateError) {
              console.error('Error al actualizar profile:', updateError);
              throw updateError;
            }
          } else {
            // Si no existe, crearlo
            const { error: profileError } = await supabase
  .from('profiles')
  .insert([{
    id: authData.user.id,
    nombre: formData.nombre,
    email: formData.email,  // ✅ Ahora SÍ agrégalo
    telefono: formData.telefono,
    rol: 'operador',
    activo: true
  }]);
            if (profileError) {
              console.error('Error al crear profile:', profileError);
              throw profileError;
            }
          }
        }

        alert('Operador creado exitosamente!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{operador ? 'Editar Operador' : 'Nuevo Operador'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Nombre y Apellido"
              required
            />
          </div>


          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="correo@ejemplo.com"
              required
            />
            <label>Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            />
          </div>

          {!operador && (
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          )}

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : operador ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
