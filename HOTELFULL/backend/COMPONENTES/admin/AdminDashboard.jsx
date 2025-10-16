import React, { useState, useEffect } from 'react';
import { supabase } from '../../../cliente/SERVICIOS/supabaseClient.jsx';
import { useNavigate } from 'react-router-dom';
import '../../../cliente/ESTILOS/Dashboard.css';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalHabitaciones: 0,
    habitacionesDisponibles: 0,
    habitacionesOcupadas: 0,
    totalOperadores: 0,
    operadoresActivos: 0
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

  const handleToggleHabitacion = async (id, currentEstado) => {
    console.log('🔄 Toggle habitación:', { id, currentEstado });
    // Cambiar entre 'disponible' y 'mantenimiento' (en vez de 'deshabilitada')
    const nuevoEstado = currentEstado === 'disponible' ? 'mantenimiento' : 'disponible';
    console.log('➡️ Nuevo estado:', nuevoEstado);

    const { error, data } = await supabase
      .from('habitaciones')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error completo:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      alert('Error al cambiar estado: ' + error.message + '\nDetalles: ' + (error.details || error.hint || 'Sin más información'));
    } else {
      console.log('✅ Actualizado exitosamente:', data);
      await loadHabitaciones();
    }
  };

  const handleToggleOperador = async (id, currentActivo) => {
    console.log('🔄 Toggle operador:', { id, currentActivo });
    // Cambiar entre true (activo) y false (deshabilitado)
    const nuevoActivo = !currentActivo;
    console.log('➡️ Nuevo activo:', nuevoActivo);

    const { error, data } = await supabase
      .from('profiles')
      .update({ activo: nuevoActivo })
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Error al actualizar operador:', error);
      alert('Error al cambiar estado del operador: ' + error.message);
    } else {
      console.log('✅ Operador actualizado:', data);
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
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>👑 Panel de Administrador - {user?.nombre}</h1>
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
          📊 Dashboard
        </button>
        <button
          className={activeSection === 'operadores' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('operadores')}
        >
          👥 Operadores
        </button>
        <button
          className={activeSection === 'habitaciones' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('habitaciones')}
        >
          🛏️ Habitaciones
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

            {/* Gráfico Simple de Barras */}
            <div className="dashboard-card">
              <h2>📊 Gráfico de Ocupación</h2>
              <div className="simple-chart">
                <div className="chart-bar-group">
                  <div className="chart-label">Disponibles</div>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar disponible"
                      style={{ width: `${(stats.habitacionesDisponibles / stats.totalHabitaciones * 100) || 0}%` }}
                    >
                      {stats.habitacionesDisponibles}
                    </div>
                  </div>
                </div>

                <div className="chart-bar-group">
                  <div className="chart-label">Ocupadas</div>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar ocupada"
                      style={{ width: `${(stats.habitacionesOcupadas / stats.totalHabitaciones * 100) || 0}%` }}
                    >
                      {stats.habitacionesOcupadas}
                    </div>
                  </div>
                </div>

                <div className="chart-bar-group">
                  <div className="chart-label">Operadores Activos</div>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar operadores"
                      style={{ width: `${(stats.operadoresActivos / (stats.totalOperadores || 1) * 100) || 0}%` }}
                    >
                      {stats.operadoresActivos}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SECCIÓN OPERADORES */}
        {activeSection === 'operadores' && (
          <div className="dashboard-card">
            <div className="section-header">
              <h2>👥 Gestión de Operadores</h2>
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
              <h2>🛏️ Gestión de Habitaciones</h2>
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
        <h2>{habitacion ? '✏️ Editar Habitación' : '➕ Nueva Habitación'}</h2>
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
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              nombre: formData.nombre,
              telefono: formData.telefono,
              rol: 'operador',
              activo: true
            }]);

          if (profileError) {
            console.error('Error al crear profile:', profileError);
            throw profileError;
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
        <h2>{operador ? '✏️ Editar Operador' : '➕ Nuevo Operador'}</h2>
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
              disabled={!!operador}
              required
            />
          </div>

          <div className="form-group">
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
