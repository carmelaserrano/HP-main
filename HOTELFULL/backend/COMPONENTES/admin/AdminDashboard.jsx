import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.jsx'
import { useNavigate } from 'react-router-dom';
import '../../../cliente/ESTILOS/Dashboard.css';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalHabitaciones: 0,
    habitacionesDisponibles: 0,
    habitacionesOcupadas: 0,
    reservasActivas: 0,
    totalUsuarios: 0,
    totalRestaurantes: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);

  // Estados para modales
  const [showNuevaHabitacion, setShowNuevaHabitacion] = useState(false);
  const [showNuevoRestaurante, setShowNuevoRestaurante] = useState(false);

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

      // Cargar estadísticas
      await loadStats();

      // Cargar datos completos
      await loadHabitaciones();
      await loadReservas();
      await loadRestaurantes();

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const { count: totalHab } = await supabase
      .from('habitaciones')
      .select('*', { count: 'exact', head: true });

    const { count: habDisponibles } = await supabase
      .from('habitaciones')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'disponible');

    const { count: habOcupadas } = await supabase
      .from('habitaciones')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'ocupada');

    const { count: reservasActivas } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['pendiente', 'confirmada']);

    const { count: totalUsuarios } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalRestaurantes } = await supabase
      .from('restaurantes')
      .select('*', { count: 'exact', head: true });

    setStats({
      totalHabitaciones: totalHab || 0,
      habitacionesDisponibles: habDisponibles || 0,
      habitacionesOcupadas: habOcupadas || 0,
      reservasActivas: reservasActivas || 0,
      totalUsuarios: totalUsuarios || 0,
      totalRestaurantes: totalRestaurantes || 0
    });
  };

  const loadHabitaciones = async () => {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('*')
      .order('numero', { ascending: true });

    if (!error) setHabitaciones(data || []);
  };

  const loadReservas = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        habitaciones (numero, tipo),
        profiles (nombre, apellido)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error) setReservas(data || []);
  };

  const loadRestaurantes = async () => {
    const { data, error } = await supabase
      .from('restaurantes')
      .select('*')
      .order('nombre', { ascending: true });

    if (!error) setRestaurantes(data || []);
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
          className={activeSection === 'habitaciones' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('habitaciones')}
        >
          🛏️ Habitaciones
        </button>
        <button
          className={activeSection === 'reservas' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('reservas')}
        >
          📅 Reservas
        </button>
        <button
          className={activeSection === 'restaurantes' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('restaurantes')}
        >
          🍽️ Restaurantes
        </button>
        <button
          className={activeSection === 'mapa' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('mapa')}
        >
          🗺️ Mapa de Ocupación
        </button>
      </div>

      <div className="dashboard-content">
        {/* DASHBOARD PRINCIPAL */}
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
                <i className="fas fa-calendar-check"></i>
                <h3>{stats.reservasActivas}</h3>
                <p>Reservas Activas</p>
              </div>

              <div className="stat-card">
                <i className="fas fa-users"></i>
                <h3>{stats.totalUsuarios}</h3>
                <p>Usuarios Totales</p>
              </div>

              <div className="stat-card">
                <i className="fas fa-utensils"></i>
                <h3>{stats.totalRestaurantes}</h3>
                <p>Restaurantes</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card">
              <h2>⚡ Acciones Rápidas</h2>
              <div className="admin-actions">
                <button className="admin-btn" onClick={() => setActiveSection('habitaciones')}>
                  <i className="fas fa-bed"></i>
                  Gestionar Habitaciones
                </button>
                <button className="admin-btn" onClick={() => setActiveSection('reservas')}>
                  <i className="fas fa-calendar-alt"></i>
                  Ver Todas las Reservas
                </button>
                <button className="admin-btn" onClick={() => setActiveSection('restaurantes')}>
                  <i className="fas fa-utensils"></i>
                  Gestionar Restaurantes
                </button>
                <button className="admin-btn" onClick={() => setActiveSection('mapa')}>
                  <i className="fas fa-map-marked-alt"></i>
                  Mapa de Ocupación
                </button>
              </div>
            </div>
          </>
        )}

        {/* SECCIÓN HABITACIONES */}
        {activeSection === 'habitaciones' && (
          <div className="dashboard-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
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
                    <th>Precio</th>
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
                      <td>${hab.precio}/noche</td>
                      <td>
                        <span className={`badge badge-${hab.estado === 'disponible' ? 'confirmada' : 'pendiente'}`}>
                          {hab.estado}
                        </span>
                      </td>
                      <td>
                        <button className="btn-action">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECCIÓN RESERVAS */}
        {activeSection === 'reservas' && (
          <div className="dashboard-card">
            <h2>📅 Todas las Reservas</h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Habitación</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map(reserva => (
                    <tr key={reserva.id}>
                      <td>#{reserva.id.substring(0, 8)}</td>
                      <td>{reserva.profiles?.nombre} {reserva.profiles?.apellido}</td>
                      <td>Hab. {reserva.habitaciones?.numero} - {reserva.habitaciones?.tipo}</td>
                      <td>{new Date(reserva.fecha_inicio).toLocaleDateString()}</td>
                      <td>{new Date(reserva.fecha_fin).toLocaleDateString()}</td>
                      <td><strong>${reserva.precio_total}</strong></td>
                      <td>
                        <span className={`badge badge-${reserva.estado}`}>
                          {reserva.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECCIÓN RESTAURANTES */}
        {activeSection === 'restaurantes' && (
          <div className="dashboard-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h2>🍽️ Gestión de Restaurantes</h2>
              <button className="btn-primary" onClick={() => setShowNuevoRestaurante(true)}>
                + Nuevo Restaurante
              </button>
            </div>

            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo de Cocina</th>
                    <th>Capacidad</th>
                    <th>Horario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurantes.map(rest => (
                    <tr key={rest.id}>
                      <td><strong>{rest.nombre}</strong></td>
                      <td>{rest.tipo_cocina}</td>
                      <td>{rest.capacidad} comensales</td>
                      <td>{rest.horario_apertura} - {rest.horario_cierre}</td>
                      <td>
                        <button className="btn-action">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MAPA DE OCUPACIÓN */}
        {activeSection === 'mapa' && (
          <div className="dashboard-card">
            <h2>🗺️ Mapa de Ocupación de Habitaciones</h2>
            <div className="ocupacion-grid">
              {habitaciones.map(hab => (
                <div
                  key={hab.id}
                  className={`habitacion-badge ${hab.estado === 'disponible' ? 'disponible' : 'ocupada'}`}
                >
                  <div className="hab-numero">{hab.numero}</div>
                  <div className="hab-tipo">{hab.tipo}</div>
                  <div className="hab-estado">{hab.estado}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nueva Habitación */}
      {showNuevaHabitacion && (
        <ModalNuevaHabitacion
          onClose={() => setShowNuevaHabitacion(false)}
          onSuccess={() => {
            setShowNuevaHabitacion(false);
            loadHabitaciones();
            loadStats();
          }}
        />
      )}

      {/* Modal Nuevo Restaurante */}
      {showNuevoRestaurante && (
        <ModalNuevoRestaurante
          onClose={() => setShowNuevoRestaurante(false)}
          onSuccess={() => {
            setShowNuevoRestaurante(false);
            loadRestaurantes();
            loadStats();
          }}
        />
      )}
    </div>
  );
}

// Componente Modal para Nueva Habitación
function ModalNuevaHabitacion({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'Simple',
    capacidad: 1,
    precio: '',
    estado: 'disponible',
    descripcion: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('habitaciones')
      .insert([formData]);

    if (error) {
      alert('Error al crear habitación: ' + error.message);
    } else {
      alert('Habitación creada exitosamente!');
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>➕ Nueva Habitación</h2>
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
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Precio por Noche</label>
            <input
              type="number"
              value={formData.precio}
              onChange={(e) => setFormData({...formData, precio: e.target.value})}
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

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Crear Habitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente Modal para Nuevo Restaurante
function ModalNuevoRestaurante({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo_cocina: '',
    capacidad: '',
    horario_apertura: '08:00',
    horario_cierre: '22:00',
    descripcion: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('restaurantes')
      .insert([formData]);

    if (error) {
      alert('Error al crear restaurante: ' + error.message);
    } else {
      alert('Restaurante creado exitosamente!');
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>➕ Nuevo Restaurante</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Cocina</label>
            <input
              type="text"
              value={formData.tipo_cocina}
              onChange={(e) => setFormData({...formData, tipo_cocina: e.target.value})}
              placeholder="Ej: Italiana, China, Parrilla"
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
            <label>Horario de Apertura</label>
            <input
              type="time"
              value={formData.horario_apertura}
              onChange={(e) => setFormData({...formData, horario_apertura: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Horario de Cierre</label>
            <input
              type="time"
              value={formData.horario_cierre}
              onChange={(e) => setFormData({...formData, horario_cierre: e.target.value})}
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

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Crear Restaurante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
