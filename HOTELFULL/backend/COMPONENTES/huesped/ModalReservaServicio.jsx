import React, { useState, useEffect } from 'react';
import { supabase } from '../../../cliente/SERVICIOS/supabaseClient';
import '../../ESTILOS/DashboardStyles.css';

function ModalReservaServicio({ onClose, onSuccess, reservaId }) {
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [precioTotal, setPrecioTotal] = useState(0);

  useEffect(() => {
    cargarServicios();
  }, []);

  // 🔹 Calcular precio total cuando cambian los servicios seleccionados
  useEffect(() => {
    calcularTotal();
  }, [serviciosSeleccionados]);

  const cargarServicios = async () => {
    const { data, error } = await supabase
      .from('servicios_extras')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al cargar servicios:', error);
      alert('Error al cargar servicios disponibles');
      return;
    }

    // Para cada servicio, calcular cuántos cupos quedan disponibles
    const serviciosConDisponibilidad = await Promise.all(
      (data || []).map(async (servicio) => {
        // Si no tiene capacidad máxima, es ilimitado
        if (!servicio.capacidad_maxima) {
          return { ...servicio, cuposDisponibles: -1 }; // -1 = ilimitado
        }

        // Contar cuántos ya reservaron este servicio
        const { data: reservas, error: errorReservas } = await supabase
          .from('reserva_servicio')
          .select('cantidad')
          .eq('servicio_id', servicio.id);

        if (errorReservas) {
          console.error('Error al contar reservas:', errorReservas);
          return { ...servicio, cuposDisponibles: servicio.capacidad_maxima };
        }

        // Sumar todas las cantidades reservadas
        const totalReservado = (reservas || []).reduce(
          (sum, r) => sum + (r.cantidad || 0),
          0
        );

        const cuposDisponibles = servicio.capacidad_maxima - totalReservado;

        return {
          ...servicio,
          cuposDisponibles,
          totalReservado
        };
      })
    );

    setServicios(serviciosConDisponibilidad);
  };

  const handleToggleServicio = (servicio) => {
    const existe = serviciosSeleccionados.find(s => s.id === servicio.id);

    if (existe) {
      // Quitar servicio
      setServiciosSeleccionados(serviciosSeleccionados.filter(s => s.id !== servicio.id));
    } else {
      // Validar que haya cupos disponibles
      if (servicio.cuposDisponibles !== -1 && servicio.cuposDisponibles <= 0) {
        alert(`⚠️ Lo sentimos, "${servicio.nombre}" está completamente reservado.\nCapacidad máxima: ${servicio.capacidad_maxima}\nYa reservados: ${servicio.totalReservado}`);
        return;
      }

      // Agregar servicio con cantidad 1
      setServiciosSeleccionados([...serviciosSeleccionados, { ...servicio, cantidad: 1 }]);
    }
  };

  const handleCantidadChange = (servicioId, nuevaCantidad) => {
    const servicio = servicios.find(s => s.id === servicioId);
    const cantidadNum = parseInt(nuevaCantidad);

    // Validar que sea un número válido y mayor a 0
    if (isNaN(cantidadNum) || cantidadNum < 1) {
      return;
    }

    // Si el servicio tiene capacidad limitada, validar
    if (servicio && servicio.cuposDisponibles !== -1) {
      if (cantidadNum > servicio.cuposDisponibles) {
        alert(`⚠️ Solo quedan ${servicio.cuposDisponibles} cupos disponibles para "${servicio.nombre}"`);
        return;
      }
    }

    setServiciosSeleccionados(
      serviciosSeleccionados.map(s =>
        s.id === servicioId ? { ...s, cantidad: cantidadNum } : s
      )
    );
  };

  const calcularTotal = () => {
    const total = serviciosSeleccionados.reduce((sum, servicio) => {
      return sum + (servicio.precio * servicio.cantidad);
    }, 0);
    setPrecioTotal(total);
  };

  // ===========================================================
  // 🧠 MANEJAR RESERVA DE SERVICIOS
  // ===========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Obtener usuario actual
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('⚠️ Debes iniciar sesión para reservar servicios');
        setLoading(false);
        return;
      }

      // ✅ Validaciones
      if (serviciosSeleccionados.length === 0) {
        alert('⚠️ Selecciona al menos un servicio');
        setLoading(false);
        return;
      }

      // ✅ Validar disponibilidad antes de insertar
      for (const servicio of serviciosSeleccionados) {
        // Obtener el servicio actualizado para verificar cupos
        const servicioActual = servicios.find(s => s.id === servicio.id);

        if (servicioActual && servicioActual.cuposDisponibles !== -1) {
          if (servicio.cantidad > servicioActual.cuposDisponibles) {
            alert(`❌ Error: "${servicioActual.nombre}" ya no tiene suficientes cupos disponibles.\n\nSolo quedan: ${servicioActual.cuposDisponibles}\nIntentaste reservar: ${servicio.cantidad}`);
            setLoading(false);
            return;
          }
        }
      }

      // ✅ Insertar cada servicio seleccionado
      for (const servicio of serviciosSeleccionados) {
        const { error } = await supabase
          .from('reserva_servicio')
          .insert([{
            servicio_id: servicio.id,
            cantidad: servicio.cantidad,
            precio_unitario: servicio.precio,
            subtotal: servicio.precio * servicio.cantidad
          }]);

        if (error) {
          console.error('Error al insertar servicio:', error);
          throw error;
        }
      }

      // 🎉 Mensaje de éxito
      const mensajeDetalle = serviciosSeleccionados.length === 1
        ? `1 servicio agregado`
        : `${serviciosSeleccionados.length} servicios agregados`;

      alert(`✅ ¡Servicios agregados exitosamente!\n\n${mensajeDetalle}\nTotal: $${precioTotal}`);

      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error al reservar servicios:', error);
      alert('❌ Error al reservar servicios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================
  // 🖼️ RENDER DEL MODAL
  // ===========================================================
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Agregar Servicios Extras</h2>

        <form onSubmit={handleSubmit}>
          {/* Lista de servicios disponibles */}
          <div className="form-group">
            <label>Selecciona los servicios *</label>

            {servicios.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Cargando servicios disponibles...
              </p>
            ) : (
              <div className="servicios-list">
                {servicios.map((servicio) => {
                  const seleccionado = serviciosSeleccionados.find(s => s.id === servicio.id);
                  const estaLleno = servicio.cuposDisponibles !== -1 && servicio.cuposDisponibles <= 0;

                  return (
                    <div
                      key={servicio.id}
                      className="servicio-item"
                      style={{
                        opacity: estaLleno ? 0.6 : 1,
                        position: 'relative'
                      }}
                    >
                      <div className="servicio-checkbox">
                        <input
                          type="checkbox"
                          checked={!!seleccionado}
                          onChange={() => handleToggleServicio(servicio)}
                          id={`servicio-${servicio.id}`}
                          disabled={estaLleno}
                        />
                        <label htmlFor={`servicio-${servicio.id}`}>
                          <strong>
                            {servicio.nombre}
                            {estaLleno && (
                              <span style={{
                                marginLeft: '10px',
                                color: '#dc3545',
                                fontSize: '0.85em',
                                fontWeight: 'bold'
                              }}>
                                ⚠️ COMPLETO
                              </span>
                            )}
                          </strong>
                          <p>{servicio.descripcion}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="servicio-precio">${servicio.precio}</span>
                            {servicio.cuposDisponibles !== -1 && (
                              <small style={{
                                color: servicio.cuposDisponibles <= 2 ? '#dc3545' : '#666',
                                fontWeight: servicio.cuposDisponibles <= 2 ? 'bold' : 'normal'
                              }}>
                                {servicio.cuposDisponibles > 0
                                  ? `${servicio.cuposDisponibles} cupos disponibles`
                                  : 'Sin cupos disponibles'
                                }
                              </small>
                            )}
                          </div>
                        </label>
                      </div>

                      {seleccionado && (
                        <div className="servicio-cantidad">
                          <label>Cantidad:</label>
                          <input
                            type="number"
                            min="1"
                            max={servicio.cuposDisponibles !== -1 ? servicio.cuposDisponibles : 10}
                            value={seleccionado.cantidad}
                            onChange={(e) => handleCantidadChange(servicio.id, e.target.value)}
                          />
                          <small>Subtotal: ${servicio.precio * seleccionado.cantidad}</small>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resumen de precio total */}
          {serviciosSeleccionados.length > 0 && (
            <div className="precio-total-box">
              <h3>Total: ${precioTotal}</h3>
              <small>
                {serviciosSeleccionados.length} servicio{serviciosSeleccionados.length > 1 ? 's' : ''} seleccionado{serviciosSeleccionados.length > 1 ? 's' : ''}
              </small>
              <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                {serviciosSeleccionados.map(s => (
                  <div key={s.id}>
                    • {s.nombre} x{s.cantidad} = ${s.precio * s.cantidad}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Agregar Servicios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalReservaServicio;