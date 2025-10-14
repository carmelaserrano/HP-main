import React, { useState, useEffect } from 'react';
import { supabase } from '../../../backend/supabaseClient.jsx'
import { useNavigate } from 'react-router-dom';
import '../../ESTILOS/Dashboard.css';

function HuespedDashboard() {
  const [user, setUser] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

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
    </div>
  );
}

export default HuespedDashboard;