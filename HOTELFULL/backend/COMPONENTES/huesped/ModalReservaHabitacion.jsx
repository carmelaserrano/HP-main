
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../cliente/SERVICIOS/supabaseClient';
import '../../../cliente/ESTILOS/Dashboard.css';

function ModalReservaHabitacion({ onClose, onSuccess, habitacion }) {
  const [formData, setFormData] = useState({
    fecha_entrada: '',
    fecha_salida: '',
    numero_huespedes: 1,
    notas: ''
  });
  const [precioTotal, setPrecioTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calcular precio total cuando cambien las fechas
  useEffect(() => {
    if (formData.fecha_entrada && formData.fecha_salida && habitacion) {
      calcularPrecio();
    }
  }, [formData.fecha_entrada, formData.fecha_salida]);

  const calcularPrecio = () => {
    const entrada = new Date(formData.fecha_entrada);
    const salida = new Date(formData.fecha_salida);
    const dias = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
    
    if (dias > 0) {
      const total = dias * habitacion.precio_por_noche;
      setPrecioTotal(total);
    } else {
      setPrecioTotal(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obtener usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Debes iniciar sesión para reservar');
        return;
      }

      // Validar fechas
      const entrada = new Date(formData.fecha_entrada);
      const salida = new Date(formData.fecha_salida);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (entrada < hoy) {
        alert('La fecha de entrada no puede ser anterior a hoy');
        return;
      }

      if (salida <= entrada) {
        alert('La fecha de salida debe ser posterior a la fecha de entrada');
        return;
      }

      // Buscar habitación por tipo
      const { data: habitacionData } = await supabase
        .from('habitaciones')
        .select('id')
        .eq('tipo', habitacion.tipo)
        .eq('estado', 'disponible')
        .limit(1)
        .single();

      if (!habitacionData) {
        alert('No hay habitaciones disponibles de este tipo');
        return;
      }

      // Verificar disponibilidad en las fechas
      const { data: reservasExistentes } = await supabase
        .from('reservas')
        .select('*')
        .eq('habitacion_id', habitacionData.id)
        .in('estado', ['pendiente', 'confirmada'])
        .or(`fecha_entrada.lte.${formData.fecha_salida},fecha_salida.gte.${formData.fecha_entrada}`);

      if (reservasExistentes && reservasExistentes.length > 0) {
        alert('Lo sentimos, la habitación no está disponible en esas fechas');
        return;
      }

      // Crear reserva
      const { error } = await supabase
        .from('reservas')
        .insert([{
          usuario_id: session.user.id,
          habitacion_id: habitacionData.id,
          fecha_entrada: formData.fecha_entrada,
          fecha_salida: formData.fecha_salida,
          numero_huespedes: formData.numero_huespedes,
          total: precioTotal,
          estado: 'pendiente',
          notas: formData.notas
        }]);

      if (error) {
        throw error;
      }

      alert('¡Reserva creada exitosamente!');
      onSuccess();
      
    } catch (error) {
      console.error('Error al crear reserva:', error);
      alert('Error al crear la reserva: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>🛏️ Reservar {habitacion?.tipo}</h2>
        
        <div className="habitacion-info-box">
          <p><strong>Tipo:</strong> {habitacion?.badge || 'Standard'}</p>
          <p><strong>Precio por noche:</strong> ${habitacion?.precio_por_noche}</p>
          <p><strong>Capacidad:</strong> {habitacion?.capacidad} Huéspedes</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fecha de Entrada *</label>
            <input
              type="date"
              value={formData.fecha_entrada}
              onChange={(e) => setFormData({...formData, fecha_entrada: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha de Salida *</label>
            <input
              type="date"
              value={formData.fecha_salida}
              onChange={(e) => setFormData({...formData, fecha_salida: e.target.value})}
              min={formData.fecha_entrada || new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Número de Huéspedes *</label>
            <input
              type="number"
              value={formData.numero_huespedes}
              onChange={(e) => setFormData({...formData, numero_huespedes: parseInt(e.target.value)})}
              min="1"
              max={habitacion?.capacidad || 10}
              required
            />
            <small>Máximo: {habitacion?.capacidad} personas</small>
          </div>

          <div className="form-group">
            <label>Notas adicionales (opcional)</label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({...formData, notas: e.target.value})}
              rows="3"
              placeholder="Solicitudes especiales, preferencias, etc."
            ></textarea>
          </div>

          {precioTotal > 0 && (
            <div className="precio-total-box">
              <h3>💰 Total: ${precioTotal}</h3>
              <small>
                {Math.ceil((new Date(formData.fecha_salida) - new Date(formData.fecha_entrada)) / (1000 * 60 * 60 * 24))} 
                {' '}noche(s) × ${habitacion?.precio_por_noche}
              </small>
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

export default ModalReservaHabitacion;