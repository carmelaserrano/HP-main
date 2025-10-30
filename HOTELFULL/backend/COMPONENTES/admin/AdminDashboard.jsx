import React, { useState, useEffect } from 'react';
import { supabase } from '../../../cliente/SERVICIOS/supabaseClient.jsx';
import { useNavigate } from 'react-router-dom';
import '../../ESTILOS/DashboardStyles.css';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [servicios, setServicios] = useState([]);
const [showNuevoServicio, setShowNuevoServicio] = useState(false);
const [editingServicio, setEditingServicio] = useState(null);
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
  const [ingresosPorMes, setIngresosPorMes] = useState([]);
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
      await loadServicios();
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
  const loadServicios = async () => {
    try {
      // Cargar servicios
      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios_extras')
        .select('*')
        .order('nombre', { ascending: true });

      if (serviciosError) {
        console.error('Error al cargar servicios:', serviciosError);
        return;
      }

      // Cargar todas las reservas (sin filtrar por fecha porque el campo fecha no existe)
      const { data: reservasData, error: reservasError } = await supabase
        .from('reserva_servicio')
        .select('servicio_id, cantidad, estado, created_at')
        .neq('estado', 'cancelada');

      if (reservasError) {
        console.error('❌ Error al cargar reservas:', reservasError);
      }

      console.log('📊 Todas las reservas activas:', reservasData);

      // Calcular cupos disponibles para cada servicio
      const serviciosConDisponibilidad = serviciosData.map(serv => {
        const reservasHoy = reservasData?.filter(r => r.servicio_id === serv.id) || [];
        const personasReservadas = reservasHoy.reduce((sum, r) => sum + (r.cantidad || 0), 0);
        const cuposDisponibles = (serv.capacidad_maxima || 0) - personasReservadas;

        console.log(`${serv.nombre}: ${personasReservadas} personas reservadas, ${cuposDisponibles} cupos disponibles`);

        return {
          ...serv,
          cuposDisponibles,
          tieneReservasHoy: reservasHoy.length > 0
        };
      });

      setServicios(serviciosConDisponibilidad);
    } catch (error) {
      console.error('Error en loadServicios:', error);
    }
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

      // Calcular ingresos reales por mes
      calcularIngresosPorMes(data || []);
    } else {
      console.error('Error al cargar reservas:', error);
    }
  };

  const calcularIngresosPorMes = (reservas) => {
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const añoActual = new Date().getFullYear();

    // Crear objeto para almacenar ingresos por mes
    const ingresosPorMesObj = {};

    // Inicializar todos los meses en 0
    mesesNombres.forEach((mes, index) => {
      ingresosPorMesObj[index] = { mes, ingresos: 0 };
    });

    // Sumar los ingresos de cada reserva al mes correspondiente
    reservas.forEach(reserva => {
      const fechaEntrada = new Date(reserva.fecha_entrada);
      const mes = fechaEntrada.getMonth();
      const año = fechaEntrada.getFullYear();

      // Solo contar reservas del año actual
      if (año === añoActual) {
        ingresosPorMesObj[mes].ingresos += parseFloat(reserva.total) || 0;
      }
    });

    // Convertir a array y tomar solo los últimos 7 meses
    const mesActual = new Date().getMonth();
    const ingresosFiltrados = [];

    for (let i = 6; i >= 0; i--) {
      const mesIndex = (mesActual - i + 12) % 12;
      ingresosFiltrados.push(ingresosPorMesObj[mesIndex]);
    }

    setIngresosPorMes(ingresosFiltrados);
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

      {/* Navigation Tabs, serian botones  */}
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
        <button
          className={activeSection === 'servicios' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('servicios')}
        >
          Servicios
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

            {/* Contenedor de gráficos lado a lado */}
            <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>

              {/* Gráfico de Torta - Estado de Habitaciones */}
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

              {/* Gráfico de Barras - Ingresos Reales por Mes */}
              <div className="dashboard-card chart-card">
                <h2>Ingresos Mensuales Reales ($)</h2>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '-10px', marginBottom: '15px' }}>
                  Últimos 7 meses del año {new Date().getFullYear()}
                </p>
                <div className="bar-chart-container">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={ingresosPorMes}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E0" />
                      <XAxis dataKey="mes" stroke="#77878B" />
                      <YAxis stroke="#77878B" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E8E8E0',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Legend />
                      <Bar dataKey="ingresos" fill="#F4B860" name="Ingresos" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
        {/* SECCIÓN SERVICIOS */}
{activeSection === 'servicios' && (
  <div className="dashboard-card">
    <div className="section-header">
      <h2>Gestión de Servicios</h2>
      <button className="btn-primary" onClick={() => setShowNuevoServicio(true)}>
        + Nuevo Servicio
      </button>
    </div>

    <div className="table-container">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Capacidad Máxima</th>
            <th>Cupos Disponibles Hoy</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map(serv => {
            const tieneCapacidad = serv.capacidad_maxima > 0;
            const tieneCupos = serv.cuposDisponibles > 0;

            // Determinar el estado
            let estadoBadge = 'badge-pendiente'; // amarillo por defecto
            let estadoTexto = 'Sin configurar';

            if (!tieneCapacidad) {
              // Sin capacidad configurada
              estadoBadge = 'badge-pendiente';
              estadoTexto = 'Sin configurar';
            } else if (tieneCupos) {
              // Tiene cupos disponibles
              estadoBadge = 'badge-confirmada';
              estadoTexto = 'Disponible';
            } else {
              // Sin cupos (completo)
              estadoBadge = 'badge-cancelada';
              estadoTexto = 'Completo';
            }

            return (
              <tr key={serv.id}>
                <td><strong>{serv.nombre}</strong></td>
                <td>{serv.descripcion || 'Sin descripción'}</td>
                <td>${serv.precio}</td>
                <td>{serv.capacidad_maxima || 'N/A'} {tieneCapacidad ? 'personas' : ''}</td>
                <td>
                  {tieneCapacidad ? `${serv.cuposDisponibles}` : 'N/A'}
                </td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => setEditingServicio(serv)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            );
          })}
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
      {showNuevoServicio && (
  <ModalServicio
    onClose={() => setShowNuevoServicio(false)}
    onSuccess={() => {
      setShowNuevoServicio(false);
      loadServicios();
    }}
  />
)}

{editingServicio && (
  <ModalServicio
    servicio={editingServicio}
    onClose={() => setEditingServicio(null)}
    onSuccess={() => {
      setEditingServicio(null);
      loadServicios();
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
    tipo: habitacion?.tipo || '',
    capacidad: habitacion?.capacidad || 1,
    precio_por_noche: habitacion?.precio_por_noche || '',
    descripcion: habitacion?.descripcion || '',
    metros_cuadrados: habitacion?.metros_cuadrados || null,
    tipo_cama: habitacion?.tipo_cama || 'Cama King size',
    wifi: habitacion?.wifi !== undefined ? habitacion.wifi : false,
    tv_smart: habitacion?.tv_smart !== undefined ? habitacion.tv_smart : false,
    aire_acondicionado: habitacion?.aire_acondicionado !== undefined ? habitacion.aire_acondicionado : false,
    bano_completo: habitacion?.bano_completo !== undefined ? habitacion.bano_completo : false
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(habitacion?.imagenes || []);
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

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Subir las nuevas imágenes
      const newImageUrls = imageFiles.length > 0 ? await uploadImages() : [];

      // Combinar imágenes existentes con las nuevas
      const allImageUrls = [...existingImages, ...newImageUrls];

      // Limpiar el formData antes de guardar
      const cleanedFormData = {
        ...formData,
        metros_cuadrados: formData.metros_cuadrados || null,
        precio_por_noche: formData.precio_por_noche ? parseFloat(formData.precio_por_noche) : 0,
        capacidad: formData.capacidad ? parseInt(formData.capacidad) : 1
      };

      const dataToSave = {
        ...cleanedFormData,
        imagenes: allImageUrls.length > 0 ? allImageUrls : []
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
            <label>Nombre</label>
            <input 
              type="text"
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              required
            />
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
            <label>Precio por Noche ($)</label>
            <input
              type="number"
              value={formData.precio_por_noche}
              onChange={(e) => setFormData({...formData, precio_por_noche: parseFloat(e.target.value)})}
              placeholder="250"
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
            <label>Metros Cuadrados (m²)</label>
            <input
              type="number"
              value={formData.metros_cuadrados || ''}
              onChange={(e) => setFormData({...formData, metros_cuadrados: e.target.value ? parseInt(e.target.value) : null})}
              placeholder="60"
            />
          </div>

          <div className="form-group">
            <label>Tipo de Cama</label>
            <select
              value={formData.tipo_cama}
              onChange={(e) => setFormData({...formData, tipo_cama: e.target.value})}
            >
              <option value="Cama King size">Cama King size</option>
              <option value="Cama Queen size">Cama Queen size</option>
              <option value="Cama Doble">Cama Doble</option>
              <option value="Cama Individual">Cama Individual</option>
              <option value="2 Camas Individuales">2 Camas Individuales</option>
              <option value="2 Camas Dobles">2 Camas Dobles</option>
            </select>
          </div>

          <div className="form-group" style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Amenidades</label>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  checked={formData.wifi}
                  onChange={(e) => setFormData({...formData, wifi: e.target.checked})}
                />
                <span>WiFi de alta velocidad</span>
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  checked={formData.tv_smart}
                  onChange={(e) => setFormData({...formData, tv_smart: e.target.checked})}
                />
                <span>Smart TV 55"</span>
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  checked={formData.aire_acondicionado}
                  onChange={(e) => setFormData({...formData, aire_acondicionado: e.target.checked})}
                />
                <span>Aire acondicionado</span>
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  checked={formData.bano_completo}
                  onChange={(e) => setFormData({...formData, bano_completo: e.target.checked})}
                />
                <span>Baño completo</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>
              Imágenes
              {(existingImages.length > 0 || imageFiles.length > 0) &&
                ` (${existingImages.length + imageFiles.length} total)`}
            </label>
          </div>

          

          <div className="form-group">
            <label>
              Imágenes
              {(existingImages.length > 0 || imageFiles.length > 0) &&
                ` (${existingImages.length + imageFiles.length} total)`}
            </label>

            {/* Mostrar imágenes existentes */}
            {existingImages.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                  Imágenes actuales:
                </p>
                <div className="image-preview-grid">
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="image-preview-item">
                      <img src={url} alt={`Imagen ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExistingImage(index);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zona para agregar nuevas imágenes */}
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
                <strong>Arrastra múltiples imágenes aquí o haz clic para seleccionar</strong>
              </p>
              <p className="upload-text" style={{ fontSize: '0.85em', marginTop: '5px', color: '#666' }}>
                Puedes seleccionar todas las imágenes que quieras (Ctrl/Cmd + clic para selección múltiple)
              </p>
            </div>

            {/* Mostrar nuevas imágenes seleccionadas */}
            {imageFiles.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                  Nuevas imágenes ({imageFiles.length}):
                </p>
                <div className="image-preview-grid">
                  {imageFiles.map((file, index) => (
                    <div key={`new-${index}`} className="image-preview-item">
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
              </div>
            )}

            {/* Botón para agregar más imágenes */}
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: '10px', width: '100%' }}
              onClick={() => document.getElementById('fileInput').click()}
            >
              + Agregar más imágenes
            </button>
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
    email: formData.email,  
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
    email: formData.email,  
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
// MODAL SERVICIO
function ModalServicio({ onClose, onSuccess, servicio }) {
  const [formData, setFormData] = useState({
    nombre: servicio?.nombre || '',
    descripcion: servicio?.descripcion || '',
    precio: servicio?.precio || '',
    capacidad_maxima: servicio?.cantidad || '',
    disponible: servicio?.disponible ?? true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(servicio?.imagenes || []);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploadedUrls = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `servicios/${fileName}`;

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
    setLoading(true);

    try {
      // Subir las nuevas imágenes
      const newImageUrls = imageFiles.length > 0 ? await uploadImages() : [];

      // Combinar imágenes existentes con las nuevas
      const allImageUrls = [...existingImages, ...newImageUrls];

      const dataToSave = {
        ...formData,
        imagenes: allImageUrls.length > 0 ? allImageUrls : []
      };

      if (servicio) {
        // Editar servicio existente
        const { error } = await supabase
          .from('servicios_extras')
          .update(dataToSave)
          .eq('id', servicio.id);

        if (error) throw error;

        // Primero cerrar el modal y recargar datos
        onSuccess();
        // Luego mostrar el mensaje
        setTimeout(() => alert('Servicio actualizado exitosamente!'), 100);
      } else {
        // Crear nuevo servicio
        const { error } = await supabase
          .from('servicios_extras')
          .insert([dataToSave]);

        if (error) throw error;

        // Primero cerrar el modal y recargar datos
        onSuccess();
        // Luego mostrar el mensaje
        setTimeout(() => alert('Servicio creado exitosamente!'), 100);
      }
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
        <h2>{servicio ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Servicio</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ej: Spa, Desayuno, Traslado..."
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows="3"
              placeholder="Describe el servicio..."
            ></textarea>
          </div>

          <div className="form-group">
            <label>Precio</label>
            <input
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value)})}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Capacidad Máxima</label>
            <input
              type="number"
              value={formData.capacidad_maxima}
              onChange={(e) => setFormData({...formData, capacidad_maxima: parseInt(e.target.value)})}
              placeholder="Ej: 10, 20, 50..."
              min="1"
            />
          </div>

          <div className="form-group">
            <label>
              Imágenes
              {(existingImages.length > 0 || imageFiles.length > 0) &&
                ` (${existingImages.length + imageFiles.length} total)`}
            </label>

            {/* Mostrar imágenes existentes */}
            {existingImages.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                  Imágenes actuales:
                </p>
                <div className="image-preview-grid">
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="image-preview-item">
                      <img src={url} alt={`Imagen ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeExistingImage(index);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zona para agregar nuevas imágenes */}
            <div
              className={`image-upload-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInputServicio').click()}
            >
              <input
                id="fileInputServicio"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div className="upload-icon">📸</div>
              <p className="upload-text">
                <strong>Arrastra múltiples imágenes aquí o haz clic para seleccionar</strong>
              </p>
              <p className="upload-text" style={{ fontSize: '0.85em', marginTop: '5px', color: '#666' }}>
                Puedes seleccionar todas las imágenes que quieras
              </p>
            </div>

            {/* Mostrar nuevas imágenes seleccionadas */}
            {imageFiles.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                  Nuevas imágenes ({imageFiles.length}):
                </p>
                <div className="image-preview-grid">
                  {imageFiles.map((file, index) => (
                    <div key={`new-${index}`} className="image-preview-item">
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
              </div>
            )}

            {/* Botón para agregar más imágenes */}
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: '10px', width: '100%' }}
              onClick={() => document.getElementById('fileInputServicio').click()}
            >
              + Agregar más imágenes
            </button>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.disponible}
                onChange={(e) => setFormData({...formData, disponible: e.target.checked})}
              />
              {' '}Disponible
            </label>
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : servicio ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
