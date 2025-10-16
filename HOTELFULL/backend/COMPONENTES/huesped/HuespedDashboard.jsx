import React, { useState, useEffect } from 'react';
import { supabase } from '../../../cliente/SERVICIOS/supabaseClient.jsx'
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../cliente/ESTILOS/Dashboard.css';
import ModalReservaHabitacion from './ModalReservaHabitacion.jsx';
import ModalReservaServicio from './ModalReservaServicio.jsx';

function HuespedDashboard() {
  const [showModalReservaHabitacion, setShowModalReservaHabitacion] = useState(false);
  const [showModalReservaServicio, setShowModalReservaServicio] = useState(false);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [user, setUser] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [reservasServicios, setReservasServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUserData();

    // Verificar si hay datos de reserva en el state o localStorage
    if (location.state?.reservationData) {
      const roomData = location.state.reservationData;
      setHabitacionSeleccionada({
        tipo: roomData.title,
        precio_por_noche: parseFloat(roomData.price),
        capacidad: parseInt(roomData.details.guests),
        badge: roomData.badge
      });
      setShowModalReservaHabitacion(true);
      localStorage.removeItem('pendingReservation');
    } else {
      const pendingReservation = localStorage.getItem('pendingReservation');
      if (pendingReservation) {
        const roomData = JSON.parse(pendingReservation);
        setHabitacionSeleccionada({
          tipo: roomData.title,
          precio_por_noche: parseFloat(roomData.price),
          capacidad: parseInt(roomData.details.guests),
          badge: roomData.badge
        });
        setShowModalReservaHabitacion(true);
        localStorage.removeItem('pendingReservation');
      }
    }
  }, [location]);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Obtener datos del usuario
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUser(profileData);

      // Obtener reservas de habitaciones del usuario
      const { data: reservasData } = await supabase
        .from('reservas')
        .select(`
          *,
          habitaciones (numero, tipo, precio_por_noche)
        `)
        .eq('usuario_id', session.user.id)
        .order('created_at', { ascending: false });

      setReservas(reservasData || []);

      // Obtener reservas de servicios
      await loadServiciosReservados(session.user.id);

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const loadServiciosReservados = async (userId) => {
    const { data, error } = await supabase
      .from('reserva_servicio')
      .select(`
        *,
        servicios_extras (nombre, precio)
      `)
      .order('created_at', { ascending: false });

    if (!error) {
      setReservasServicios(data || []);
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
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏨 Bienvenido, {user?.nombre}</h1>
        <button onClick={handleLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>

      <div className="dashboard-content">
        {/* SECCIÓN: Reservas de Habitaciones */}
        <div className="dashboard-card">
          <h2>📅 Mis Reservas de Habitaciones</h2>

          {reservas.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <p>No tienes reservas de habitaciones aún</p>
              <button
                onClick={() => navigate('/rooms')}
                className="btn-primary"
              >
                Ver Habitaciones
              </button>
            </div>
          ) : (
            <div className="reservas-list">
              {reservas.map((reserva) => (
                <div key={reserva.id} className="reserva-card">
                  <div className="reserva-header">
                    <h3>Habitación {reserva.habitaciones.numero}</h3>
                    <span className={`badge badge-${reserva.estado}`}>
                      {reserva.estado}
                    </span>
                  </div>
                  <div className="reserva-details">
                    <p><i className="fas fa-bed"></i> {reserva.habitaciones.tipo}</p>
                    <p><i className="fas fa-calendar-check"></i> Check-in: {reserva.fecha_entrada}</p>
                    <p><i className="fas fa-calendar-times"></i> Check-out: {reserva.fecha_salida}</p>
                    <p><i className="fas fa-users"></i> Huéspedes: {reserva.numero_huespedes}</p>
                    <p className="reserva-total">
                      <i className="fas fa-dollar-sign"></i> Total: ${reserva.total}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NUEVA SECCIÓN: Servicios Reservados */}
        {reservasServicios.length > 0 && (
          <div className="dashboard-card">
            <h2>✨ Mis Servicios Reservados</h2>
            <div className="reservas-list">
              {reservasServicios.map((reserva) => (
                <div key={reserva.id} className="reserva-card">
                  <div className="reserva-header">
                    <h3>{reserva.servicios_extras?.nombre || 'Servicio'}</h3>
                    <span className="badge badge-pendiente">
                      Reservado
                    </span>
                  </div>
                  <div className="reserva-details">
                    <p><i className="fas fa-calendar"></i> Fecha: {reserva.fecha_servicio || 'Por confirmar'}</p>
                    <p><i className="fas fa-hashtag"></i> Cantidad: {reserva.cantidad}</p>
                    <p><i className="fas fa-dollar-sign"></i> Precio unitario: ${reserva.precio_unitario}</p>
                    <p className="reserva-total">
                      <i className="fas fa-calculator"></i> Subtotal: ${reserva.subtotal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECCIÓN: Acciones Rápidas */}
        <div className="dashboard-card">
          <h2>⚡ Acciones Rápidas</h2>
          <div className="quick-actions">
            <button onClick={() => navigate('/rooms')} className="action-btn">
              <i className="fas fa-bed"></i>
              Reservar Habitación
            </button>
            <button onClick={() => setShowModalReservaServicio(true)} className="action-btn">
              <i className="fas fa-spa"></i>
              Reservar Servicios
            </button>
            <button onClick={() => navigate('/contacto')} className="action-btn">
              <i className="fas fa-phone"></i>
              Contacto
            </button>
          </div>
        </div>
      </div>

      {/* 🛏️ Modal Reserva Habitación */}
      {showModalReservaHabitacion && (
        <ModalReservaHabitacion
          onClose={() => setShowModalReservaHabitacion(false)}
          onSuccess={loadUserData}
          habitacion={habitacionSeleccionada}
        />
      )}

      {/* ✨ Modal Reserva Servicios */}
      {showModalReservaServicio && (
        <ModalReservaServicio
          onClose={() => setShowModalReservaServicio(false)}
          onSuccess={loadUserData}
        />
      )}
    </div>
  );
}

export default HuespedDashboard;