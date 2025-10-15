import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.jsx'
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../cliente/ESTILOS/Dashboard.css';

function HuespedDashboard() {
  const [user, setUser] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  const [formData, setFormData] = useState({
    fechaEntrada: '',
    fechaSalida: '',
    numeroHuespedes: 1,
    observaciones: ''
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUserData();

    // Verificar si hay datos de reserva en el state o localStorage
    if (location.state?.reservationData) {
      setReservationData(location.state.reservationData);
      setShowReservationForm(true);
      // Limpiar localStorage
      localStorage.removeItem('pendingReservation');
    } else {
      const pendingReservation = localStorage.getItem('pendingReservation');
      if (pendingReservation) {
        setReservationData(JSON.parse(pendingReservation));
        setShowReservationForm(true);
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

      // Obtener reservas del usuario
      const { data: reservasData } = await supabase
        .from('reservas')
        .select(`
          *,
          habitaciones (numero, tipo, precio_por_noche)
        `)
        .eq('usuario_id', session.user.id)
        .order('created_at', { ascending: false });

      setReservas(reservasData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fechaEntrada || !formData.fechaSalida) {
      alert('Por favor, completa las fechas de entrada y salida');
      return;
    }

    // Validar que la fecha de salida sea posterior a la fecha de entrada
    if (new Date(formData.fechaSalida) <= new Date(formData.fechaEntrada)) {
      alert('La fecha de salida debe ser posterior a la fecha de entrada');
      return;
    }

    try {
      // Calcular número de noches
      const entrada = new Date(formData.fechaEntrada);
      const salida = new Date(formData.fechaSalida);
      const noches = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
      const precioPorNoche = parseFloat(reservationData.price);
      const total = noches * precioPorNoche;

      // Buscar la habitación en la base de datos por título
      const { data: habitacionData, error: habitacionError } = await supabase
        .from('habitaciones')
        .select('id')
        .eq('tipo', reservationData.title)
        .single();

      let habitacionId = habitacionData?.id;

      // Si no existe la habitación, crearla
      if (!habitacionId) {
        const { data: nuevaHabitacion, error: crearError } = await supabase
          .from('habitaciones')
          .insert([{
            numero: Math.floor(Math.random() * 900) + 100,
            tipo: reservationData.title,
            precio_por_noche: precioPorNoche,
            capacidad: formData.numeroHuespedes,
            estado: 'disponible'
          }])
          .select()
          .single();

        if (crearError) {
          console.error('Error al crear habitación:', crearError);
          alert('Error al procesar la habitación');
          return;
        }
        habitacionId = nuevaHabitacion.id;
      }

      // Crear la reserva
      const { data: nuevaReserva, error: reservaError } = await supabase
        .from('reservas')
        .insert([{
          usuario_id: user.id,
          habitacion_id: habitacionId,
          fecha_entrada: formData.fechaEntrada,
          fecha_salida: formData.fechaSalida,
          numero_huespedes: formData.numeroHuespedes,
          estado: 'pendiente',
          total: total,
          observaciones: formData.observaciones
        }])
        .select();

      if (reservaError) {
        console.error('Error al crear reserva:', reservaError);
        alert('Error al crear la reserva: ' + reservaError.message);
        return;
      }

      alert('¡Reserva creada exitosamente! Total: $' + total);
      setShowReservationForm(false);
      setReservationData(null);
      setFormData({
        fechaEntrada: '',
        fechaSalida: '',
        numeroHuespedes: 1,
        observaciones: ''
      });

      // Recargar reservas
      loadUserData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la reserva');
    }
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
        <div className="dashboard-card">
          <h2>📅 Mis Reservas</h2>

          {reservas.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <p>No tienes reservas aún</p>
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

        <div className="dashboard-card">
          <h2>⚡ Acciones Rápidas</h2>
          <div className="quick-actions">
            <button onClick={() => navigate('/rooms')} className="action-btn">
              <i className="fas fa-search"></i>
              Ver Habitaciones
            </button>
            <button onClick={() => navigate('/servicios')} className="action-btn">
              <i className="fas fa-concierge-bell"></i>
              Servicios
            </button>
            <button onClick={() => navigate('/contacto')} className="action-btn">
              <i className="fas fa-phone"></i>
              Contacto
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      {showReservationForm && reservationData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Reservar {reservationData.title}</h2>

            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
              <p><strong>Tipo:</strong> {reservationData.badge}</p>
              <p><strong>Precio por noche:</strong> ${reservationData.price}</p>
              <p><strong>Capacidad:</strong> {reservationData.details.guests}</p>
              <p><strong>Tamaño:</strong> {reservationData.details.size}</p>
            </div>

            <form onSubmit={handleReservationSubmit}>
              <div className="form-group">
                <label>Fecha de Entrada</label>
                <input
                  type="date"
                  value={formData.fechaEntrada}
                  onChange={(e) => setFormData({...formData, fechaEntrada: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha de Salida</label>
                <input
                  type="date"
                  value={formData.fechaSalida}
                  onChange={(e) => setFormData({...formData, fechaSalida: e.target.value})}
                  min={formData.fechaEntrada || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Número de Huéspedes</label>
                <input
                  type="number"
                  value={formData.numeroHuespedes}
                  onChange={(e) => setFormData({...formData, numeroHuespedes: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Observaciones (opcional)</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  placeholder="Solicitudes especiales, preferencias, etc."
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowReservationForm(false);
                    setReservationData(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HuespedDashboard;