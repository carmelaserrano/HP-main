import React, { useState, useEffect } from 'react';
import { supabase } from '../../../cliente/SERVICIOS/supabaseClient.jsx';
import { useNavigate } from 'react-router-dom';
import '../../ESTILOS/DashboardStyles.css';


function OperadorDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('mapa');

  // Estados para datos
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]);

  // Estados para modales
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

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
      await loadReservas();

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const loadHabitaciones = async () => {
    console.log('🔄 Cargando habitaciones...');
    const { data, error } = await supabase
      .from('habitaciones')
      .select('*')
      .order('numero', { ascending: true });

    if (error) {
      console.error('❌ Error al cargar habitaciones:', error);
    } else {
      console.log('✅ Habitaciones cargadas:', data);
      // Mostrar específicamente la habitación 301
      const hab301 = data.find(h => h.numero === '301' || h.numero === 301);
      if (hab301) {
        console.log('🏠 Estado de habitación 301:', hab301);
      }
    }

    setHabitaciones(data || []);
  };

  const loadReservas = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select('*, habitaciones(numero, tipo)')
      .in('estado', ['pendiente', 'confirmada'])
      .order('fecha_entrada', { ascending: true });

    if (!error) {
      setReservas(data || []);
    } else {
      console.error('Error al cargar reservas:', error);
    }
  };
const handleLiberarReserva = async (reservaId) => {
    if (!confirm('¿Estás seguro de liberar esta reserva?')) return;

    try {
      console.log('🔄 Iniciando liberación de reserva:', reservaId);

      // Primero obtenemos la reserva para saber qué habitación liberar
      const { data: reservaData, error: fetchError } = await supabase
        .from('reservas')
        .select('habitacion_id')
        .eq('id', reservaId)
        .single();

      if (fetchError) {
        console.error('❌ Error al obtener reserva:', fetchError);
        throw fetchError;
      }

      console.log('📋 Datos de reserva obtenidos:', reservaData);

      if (!reservaData?.habitacion_id) {
        throw new Error('No se encontró habitacion_id en la reserva');
      }

      // Liberar la habitación PRIMERO (volver a disponible)
      console.log('🏠 Liberando habitación ID:', reservaData.habitacion_id);

      const { error: habitacionError, data: habitacionData } = await supabase
        .from('habitaciones')
        .update({ estado: 'disponible' })
        .eq('id', reservaData.habitacion_id)
        .select();

      if (habitacionError) {
        console.error('❌ Error al liberar habitación:', habitacionError);
        throw habitacionError;
      }

      console.log('✅ Habitación liberada exitosamente:', habitacionData);

      // DESPUÉS cancelar la reserva
      const { error: reservaError } = await supabase
        .from('reservas')
        .update({ estado: 'cancelada' })
        .eq('id', reservaId);

      if (reservaError) {
        console.error('❌ Error al cancelar reserva:', reservaError);
        throw reservaError;
      }

      console.log('✅ Reserva cancelada exitosamente');

      // Recargar datos
      await loadHabitaciones();
      await loadReservas();

      alert('Reserva liberada exitosamente. La habitación está ahora disponible.');
    } catch (error) {
      console.error('❌ Error en handleLiberarReserva:', error);
      alert('Error al liberar reserva: ' + error.message);
    }
  };

  const handleProcesarPago = (reserva) => {
    setReservaSeleccionada(reserva);
    setShowPagoModal(true);
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
        <h1>Panel de Operador - {user?.nombre}</h1>
        <button onClick={handleLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeSection === 'mapa' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('mapa')}
        >
          Mapa de Habitaciones
        </button>
        <button
          className={activeSection === 'reservas' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('reservas')}
        >
          Gestión de Reservas
        </button>
        <button
          className={activeSection === 'pagos' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('pagos')}
        >
          Procesar Pagos
        </button>
      </div>

      <div className="dashboard-content">

        {/* MAPA DE HABITACIONES */}
        {activeSection === 'mapa' && (
          <div className="dashboard-card">
            <h2>Mapa de Habitaciones</h2>
            <div className="mapa-simple-grid">
              {habitaciones.map(hab => (
                <div key={hab.id} className={`hab-simple ${hab.estado}`}>
                  <div className="hab-simple-numero">{hab.numero}</div>
                  <div className="hab-simple-tipo">{hab.tipo}</div>
                  <div className="hab-simple-estado">{hab.estado}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GESTIÓN DE RESERVAS */}
        {activeSection === 'reservas' && (
          <div className="dashboard-card">
            <h2>Gestión de Reservas Activas</h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Habitación</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Huéspedes</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map(reserva => (
                    <tr key={reserva.id}>
                      <td>#{String(reserva.id).substring(0, 8)}</td>
                      <td>
                        <strong>Hab. {reserva.habitaciones?.numero}</strong>
                        <br />
                        <small>{reserva.habitaciones?.tipo}</small>
                      </td>
                      <td>{new Date(reserva.fecha_entrada).toLocaleDateString()}</td>
                      <td>{new Date(reserva.fecha_salida).toLocaleDateString()}</td>
                      <td>{reserva.numero_huespedes} personas</td>
                      <td>
                        <span className={`badge badge-${reserva.estado}`}>
                          {reserva.estado}
                        </span>
                      </td>
                      <td><strong>${reserva.total}</strong></td>
                      <td>
                        <button
                          className="btn-danger"
                          onClick={() => handleLiberarReserva(reserva.id)}
                          style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                        >
                          Liberar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reservas.length === 0 && (
                <p style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No hay reservas activas en este momento
                </p>
              )}
            </div>
          </div>
        )}

        {/* PROCESAR PAGOS */}
        {activeSection === 'pagos' && (
          <div className="dashboard-card">
            <h2>Procesar Pagos de Reservas</h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Habitación</th>
                    <th>Fechas</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.filter(r => r.estado === 'pendiente').map(reserva => (
                    <tr key={reserva.id}>
                      <td>#{String(reserva.id).substring(0, 8)}</td>
                      <td>
                        <strong>Hab. {reserva.habitaciones?.numero}</strong>
                        <br />
                        <small>{reserva.habitaciones?.tipo}</small>
                      </td>
                      <td>
                        {new Date(reserva.fecha_entrada).toLocaleDateString()} - {new Date(reserva.fecha_salida).toLocaleDateString()}
                      </td>
                      <td><strong>${reserva.total}</strong></td>
                      <td>
                        <span className="badge badge-pendiente">
                          Pendiente de pago
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-primary"
                          onClick={() => handleProcesarPago(reserva)}
                          style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                        >
                          Procesar Pago
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reservas.filter(r => r.estado === 'pendiente').length === 0 && (
                <p style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No hay pagos pendientes
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Procesar Pago */}
      {showPagoModal && reservaSeleccionada && (
        <ModalProcesarPago
          reserva={reservaSeleccionada}
          onClose={() => {
            setShowPagoModal(false);
            setReservaSeleccionada(null);
          }}
          onSuccess={() => {
            setShowPagoModal(false);
            setReservaSeleccionada(null);
            loadReservas();
            loadHabitaciones();
          }}
        />
      )}
    </div>
  );
}

// MODAL PROCESAR PAGO
function ModalProcesarPago({ reserva, onClose, onSuccess }) {
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔍 Procesando pago para reserva:', reserva);
      console.log('🔍 Habitación ID:', reserva.habitacion_id);

      // Actualizar estado de la reserva a 'confirmada'
      const { error: reservaError, data: reservaData } = await supabase
        .from('reservas')
        .update({ estado: 'confirmada' })
        .eq('id', reserva.id)
        .select();

      if (reservaError) throw reservaError;
      console.log('✅ Reserva actualizada:', reservaData);

      // Cambiar estado de la habitación a 'ocupada'
      const { error: habitacionError, data: habitacionData } = await supabase
        .from('habitaciones')
        .update({ estado: 'ocupada' })
        .eq('id', reserva.habitacion_id)
        .select();

      if (habitacionError) {
        console.error(' Error al actualizar habitación:', habitacionError);
        throw habitacionError;
      }
      console.log('✅ Habitación actualizada:', habitacionData);

      alert(`Pago de $${reserva.total} procesado exitosamente vía ${metodoPago}. Habitación cambiada a OCUPADA.`);
      onSuccess();
    } catch (error) {
      console.error(' Error al procesar pago:', error);
      alert('Error al procesar pago: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>💰 Procesar Pago</h2>

        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
          <p><strong>Reserva:</strong> #{String(reserva.id).substring(0, 8)}</p>
          <p><strong>Habitación:</strong> {reserva.habitaciones?.numero} - {reserva.habitaciones?.tipo}</p>
          <p><strong>Check-in:</strong> {new Date(reserva.fecha_entrada).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> {new Date(reserva.fecha_salida).toLocaleDateString()}</p>
          <p style={{ fontSize: '1.3rem', marginTop: '15px' }}>
            <strong>Total a cobrar: ${reserva.total}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Método de Pago</label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              required
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta de Crédito/Débito</option>
              <option value="transferencia">Transferencia Bancaria</option>
            </select>
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OperadorDashboard;
