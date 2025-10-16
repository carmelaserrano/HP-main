import React, { useState, useEffect } from 'react';
import { supabase } from '../../../cliente/SERVICIOS/supabaseClient';
import '../../../cliente/ESTILOS/Dashboard.css';

function ModalReservaServicio({ onClose, onSuccess }) {
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarServicios();
  }, []);


  const cargarServicios = async () => {
    console.log('🔍 Intentando cargar servicios...');

    const { data, error } = await supabase
      .from('servicios_extras')
      .select('*');

    console.log('✅ Datos recibidos:', data);
    console.log('❌ Error:', error);
    console.log('📊 Cantidad de servicios:', data?.length);

    if (!error) {
      setServicios(data || []);
    }
  };

  const handleToggleServicio = (servicio) => {
    const existe = serviciosSeleccionados.find(s => s.id === servicio.id);

    if (existe) {
      // Quitar servicio
      setServiciosSeleccionados(serviciosSeleccionados.filter(s => s.id !== servicio.id));
    } else {
      // Agregar servicio con cantidad 1
      setServiciosSeleccionados([...serviciosSeleccionados, { ...servicio, cantidad: 1 }]);
    }
  };

  const handleCantidadChange = (servicioId, cantidad) => {
    setServiciosSeleccionados(
      serviciosSeleccionados.map(s =>
        s.id === servicioId ? { ...s, cantidad: parseInt(cantidad) || 1 } : s
      )
    );
  };

  const calcularTotal = () => {
    return serviciosSeleccionados.reduce((total, servicio) => {
      return total + (servicio.precio * servicio.cantidad);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obtener usuario actual
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Debes iniciar sesión para reservar servicios');
        return;
      }

      if (serviciosSeleccionados.length === 0) {
        alert('Selecciona al menos un servicio');
        return;
      }

      if (!fecha) {
        alert('Selecciona una fecha');
        return;
      }

      // Insertar cada servicio seleccionado
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
          console.error('❌ Error detallado:', error);
          throw error;
        }
      }

      alert('¡Servicios reservados exitosamente!');
      onSuccess();

    } catch (error) {
      console.error('Error al reservar servicios:', error);
      alert('Error al reservar servicios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>✨ Reservar Servicios</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fecha del servicio *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Selecciona los servicios</label>
            {console.log('🎨 Renderizando servicios:', servicios)}
            {servicios.length === 0 && <p style={{padding: '20px', textAlign: 'center', color: '#666'}}>No hay servicios disponibles</p>}
            
            <div className="servicios-list">
              {servicios.map((servicio) => {
                const seleccionado = serviciosSeleccionados.find(s => s.id === servicio.id);

                return (
                  <div key={servicio.id} className="servicio-item">
                    <div className="servicio-checkbox">
                      <input
                        type="checkbox"
                        checked={!!seleccionado}
                        onChange={() => handleToggleServicio(servicio)}
                        id={`servicio-${servicio.id}`}
                      />
                      <label htmlFor={`servicio-${servicio.id}`}>
                        <strong>{servicio.nombre}</strong>
                        <p>{servicio.descripcion}</p>
                        <span className="servicio-precio">${servicio.precio}</span>
                      </label>
                    </div>

                    {seleccionado && (
                      <div className="servicio-cantidad">
                        <label>Cantidad:</label>
                        <input
                          type="number"
                          min="1"
                          value={seleccionado.cantidad}
                          onChange={(e) => handleCantidadChange(servicio.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {serviciosSeleccionados.length > 0 && (
            <div className="precio-total-box">
              <h3>💰 Total: ${calcularTotal()}</h3>
              <small>{serviciosSeleccionados.length} servicio(s) seleccionado(s)</small>
            </div>
          )}

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalReservaServicio;