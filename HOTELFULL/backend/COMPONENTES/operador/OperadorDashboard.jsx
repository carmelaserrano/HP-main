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
  const [serviciosReservados, setServiciosReservados] = useState([]);

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
      await loadServiciosReservados();

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
      setHabitaciones([]);
      return;
    }

    // Cargar reservas activas para calcular el estado real
    const { data: reservasActivas } = await supabase
      .from('reservas')
      .select('*, habitaciones(numero)')
      .in('estado', ['pendiente', 'confirmada']);

    console.log('📅 Reservas activas encontradas:', reservasActivas);

    // Obtener fecha local (sin conversión a UTC)
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, '0');
    const day = String(ahora.getDate()).padStart(2, '0');
    const hoy = `${year}-${month}-${day}`;
    console.log('📅 Fecha de hoy (local):', hoy);

    // Calcular estado real de cada habitación
    const habitacionesConEstadoReal = (data || []).map(hab => {
      // Buscar si tiene reserva activa para hoy
      const tieneReservaActiva = (reservasActivas || []).some(reserva => {
        const fechaEntrada = reserva.fecha_entrada;
        const fechaSalida = reserva.fecha_salida;

        const cumpleCondicion = reserva.habitacion_id === hab.id &&
               fechaEntrada <= hoy &&
               fechaSalida >= hoy;

        if (hab.numero === '601' || hab.numero === 601) {
          console.log(`🔍 Habitación 601:`, {
            reserva_id: reserva.id,
            habitacion_numero: reserva.habitaciones?.numero,
            fechaEntrada,
            fechaSalida,
            hoy,
            cumpleCondicion
          });
        }

        return cumpleCondicion;
      });

      const estadoFinal = tieneReservaActiva ? 'ocupada' : hab.estado;

      if (hab.numero === '601' || hab.numero === 601) {
        console.log(`🏠 Habitación 601 estado final:`, {
          tieneReservaActiva,
          estadoOriginal: hab.estado,
          estadoFinal
        });
      }

      return {
        ...hab,
        estadoReal: estadoFinal
      };
    });

    console.log('✅ Habitaciones con estado real:', habitacionesConEstadoReal);
    setHabitaciones(habitacionesConEstadoReal);
  };

  const loadReservas = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        habitaciones(numero, tipo),
        profiles(nombre, email, telefono)
      `)
      .in('estado', ['pendiente', 'confirmada'])
      .order('fecha_entrada', { ascending: true });

    if (!error) {
      setReservas(data || []);
    } else {
      console.error('Error al cargar reservas:', error);
    }
  };

  const loadServiciosReservados = async () => {
    const { data, error } = await supabase
      .from('reserva_servicio')
      .select(`
        *,
        servicios_extras (
          nombre,
          descripcion,
          precio
        )
      `)
      .order('created_at', { ascending: false });

    if (!error) {
      setServiciosReservados(data || []);
    } else {
      console.error('Error al cargar servicios reservados:', error);
    }
  };
  const handleEliminarServicio = async (servicioId) => {
    if (!confirm('¿Estás seguro de eliminar este servicio reservado?')) return;

    try {
      const { error } = await supabase
        .from('reserva_servicio')
        .delete()
        .eq('id', servicioId);

      if (error) throw error;

      alert('✅ Servicio eliminado exitosamente');
      await loadServiciosReservados();
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
      alert('❌ Error al eliminar servicio: ' + error.message);
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

      console.log('Datos de reserva obtenidos:', reservaData);

      if (!reservaData?.habitacion_id) {
        throw new Error('No se encontró habitacion_id en la reserva');
      }

      // Liberar la habitación PRIMERO (volver a disponible)
      console.log('Liberando habitación ID:', reservaData.habitacion_id);

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
          className={activeSection === 'servicios' ? 'tab-active' : 'tab'}
          onClick={() => setActiveSection('servicios')}
        >
          Servicios Reservados
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
              {habitaciones.map(hab => {
                const estado = (hab.estadoReal || hab.estado || 'disponible').toLowerCase();
                return (
                  <div key={hab.id} className={`hab-simple ${estado}`}>
                    <div className="hab-simple-numero">{hab.numero}</div>
                    <div className="hab-simple-tipo">{hab.tipo}</div>
                    <div className="hab-simple-estado">{estado.toUpperCase()}</div>
                  </div>
                );
              })}
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
                    <th>Huésped</th>
                    <th>Habitación</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Personas</th>
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
                        <strong>{reserva.profiles?.nombre || 'N/A'}</strong>
                        <br />
                        <small style={{ color: '#666' }}>
                          {reserva.profiles?.email || 'Sin email'}
                        </small>
                        {reserva.profiles?.telefono && (
                          <>
                            <br />
                            <small style={{ color: '#666' }}>
                              📞 {reserva.profiles.telefono}
                            </small>
                          </>
                        )}
                      </td>
                      <td>
                        <strong>Hab. {reserva.habitaciones?.numero}</strong>
                        <br />
                        <small>{reserva.habitaciones?.tipo}</small>
                      </td>
                      <td>{reserva.fecha_entrada.split('-').reverse().join('/')}</td>
                      <td>{reserva.fecha_salida.split('-').reverse().join('/')}</td>
                      <td>{reserva.numero_huespedes}</td>
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

        {/* SERVICIOS RESERVADOS */}
        {activeSection === 'servicios' && (
          <div className="dashboard-card">
            <h2>Servicios Reservados</h2>
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Servicio</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                    <th>Fecha Reserva</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {serviciosReservados.map(servicio => (
                    <tr key={servicio.id}>
                      <td>#{servicio.id}</td>
                      <td>
                        <strong>{servicio.servicios_extras?.nombre}</strong>
                        <br />
                        <small style={{ color: '#666' }}>
                          {servicio.servicios_extras?.descripcion}
                        </small>
                      </td>
                      <td>{servicio.cantidad}</td>
                      <td>${servicio.precio_unitario}</td>
                      <td><strong>${servicio.subtotal}</strong></td>
                      <td>
                        {new Date(servicio.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <button
                          className="btn-danger"
                          onClick={() => handleEliminarServicio(servicio.id)}
                          style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {serviciosReservados.length === 0 && (
                <p style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                  No hay servicios reservados en este momento
                </p>
              )}
            </div>

            {/* Resumen de servicios */}
            {serviciosReservados.length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#f5f5f5',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>Total de servicios reservados:</strong> {serviciosReservados.length}
                </div>
                <div>
                  <strong>Ingresos totales:</strong> $
                  {serviciosReservados.reduce((sum, s) => sum + parseFloat(s.subtotal || 0), 0).toFixed(2)}
                </div>
              </div>
            )}
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
                        {reserva.fecha_entrada.split('-').reverse().join('/')} - {reserva.fecha_salida.split('-').reverse().join('/')}
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
