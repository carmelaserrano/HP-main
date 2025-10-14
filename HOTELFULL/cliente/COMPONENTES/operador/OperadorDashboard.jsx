import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../ESTILOS/Dashboard.css';
import { supabase } from '../../../backend/supabaseClient.jsx'
function OperadorDashboard() {
  const [user, setUser] = useState(null);
  const [reservasHoy, setReservasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
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

      // Obtener reservas de hoy
      const today = new Date().toISOString().split('T')[0];
      const { data: reservasData } = await supabase
        .from('reservas')
        .select(`
          *,
          habitaciones (numero, tipo),
          profiles (nombre)
        `)
        .eq('fecha_entrada', today)
        .order('created_at', { ascending: false });

      setReservasHoy(reservasData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleCheckIn = async (reservaId) => {
    const { error } = await supabase
      .from('reservas')
      .update({ estado: 'confirmada' })
      .eq('id', reservaId);

    if (!error) {
      alert('Check-in realizado correctamente');
      loadData();
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
        <h1>👨‍💼 Panel de Operador - {user?.nombre}</h1>
        <button onClick={handleLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-calendar-check"></i>
            <h3>{reservasHoy.length}</h3>
            <p>Check-ins Hoy</p>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>📋 Reservas de Hoy</h2>
          
          {reservasHoy.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-check"></i>
              <p>No hay check-ins programados para hoy</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Habitación</th>
                    <th>Huésped</th>
                    <th>Check-out</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasHoy.map((reserva) => (
                    <tr key={reserva.id}>
                      <td>
                        {reserva.habitaciones.numero} - {reserva.habitaciones.tipo}
                      </td>
                      <td>{reserva.profiles.nombre}</td>
                      <td>{reserva.fecha_salida}</td>
                      <td>
                        <span className={`badge badge-${reserva.estado}`}>
                          {reserva.estado}
                        </span>
                      </td>
                      <td>
                        {reserva.estado === 'pendiente' && (
                          <button 
                            onClick={() => handleCheckIn(reserva.id)}
                            className="btn-action"
                          >
                            ✓ Check-in
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OperadorDashboard;