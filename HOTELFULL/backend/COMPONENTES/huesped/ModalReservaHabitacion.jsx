import React, { useState, useEffect } from "react";
import { supabase } from "../../../cliente/SERVICIOS/supabaseClient";
import "../../ESTILOS/DashboardStyles.css";

function ModalReservaHabitacion({ onClose, onSuccess, habitacion }) {
  const [formData, setFormData] = useState({
    fecha_entrada: "",
    fecha_salida: "",
    numero_huespedes: 1,
    notas: "",
  });
  const [precioTotal, setPrecioTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 Calcular precio total cuando cambian las fechas
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

  // ===========================================================
  // 🧠 MANEJAR RESERVA
  // ===========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Obtener usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Debes iniciar sesión para reservar");
        return;
      }

      // ✅ Validar fechas
      const [yIn, mIn, dIn] = formData.fecha_entrada.split("-").map(Number);
      const [yOut, mOut, dOut] = formData.fecha_salida.split("-").map(Number);
      const entrada = new Date(yIn, mIn - 1, dIn);
      const salida = new Date(yOut, mOut - 1, dOut);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (entrada < hoy) {
        alert("⚠️ La fecha de entrada no puede ser anterior a hoy");
        return;
      }

      if (salida <= entrada) {
        alert("⚠️ La fecha de salida debe ser posterior a la fecha de entrada");
        return;
      }

      // 🔹 Traer todas las habitaciones del mismo tipo
      const { data: habitacionesTipo, error: errorHabitaciones } = await supabase
        .from("habitaciones")
        .select("id, tipo, estado")
        .eq("tipo", habitacion.tipo);

      if (errorHabitaciones) throw errorHabitaciones;
      if (!habitacionesTipo || habitacionesTipo.length === 0) {
        alert("No existen habitaciones de este tipo en la base de datos");
        return;
      }

      // 🔍 Buscar una habitación libre (sin reservas superpuestas)
      let habitacionLibre = null;
      const entradaNueva = new Date(formData.fecha_entrada);
      const salidaNueva = new Date(formData.fecha_salida);

      for (const hab of habitacionesTipo) {
        const { data: reservasExistentes, error: errorRes } = await supabase
          .from("reservas")
          .select("fecha_entrada, fecha_salida, estado")
          .eq("habitacion_id", hab.id)
          .in("estado", ["pendiente", "confirmada"]);

        if (errorRes) throw errorRes;
// // "El sistema permite que una persona reserve el día de check-out de otra reserva porque en la operativa hotelera real:
// Check-out: 11:00 AM (huésped anterior se retira)
// Check-in: 14:00 PM (nuevo huésped ingresa)
// Por lo tanto, hay un período de 3 horas (11 AM - 2 PM) para limpieza y preparación de la habitación. Esto permite maximizar la ocupación del hotel sin conflictos."
        const haySolapamiento = reservasExistentes.some((r) => {
          const inicio = new Date(r.fecha_entrada);
          const fin = new Date(r.fecha_salida);
          return (
            (entradaNueva >= inicio && entradaNueva < fin) ||
            (salidaNueva > inicio && salidaNueva <= fin) ||
            (entradaNueva <= inicio && salidaNueva >= fin)
          );
        });

        if (!haySolapamiento) {
          habitacionLibre = hab;
          break;
        }
      }

      // 🚫 Si no hay ninguna libre
      if (!habitacionLibre) {
        alert("🚫 No hay habitaciones disponibles de este tipo en esas fechas");
        return;
      }

      // ✅ Crear reserva con la habitación libre encontrada
      const { error: reservaError } = await supabase.from("reservas").insert([
        {
          usuario_id: session.user.id,
          habitacion_id: habitacionLibre.id,
          fecha_entrada: formData.fecha_entrada,
          fecha_salida: formData.fecha_salida,
          numero_huespedes: formData.numero_huespedes,
          total: precioTotal,
          estado: "pendiente",
          notas: formData.notas,
        },
      ]);

      if (reservaError) throw reservaError;

      // 🏨 NO actualizar el estado en la base de datos
      // El dashboard del operador calcula el estado en tiempo real basándose en las fechas de reservas
      // Esto permite que las habitaciones con reservas futuras sigan apareciendo como disponibles
      console.log('✅ Reserva creada. El estado se calculará automáticamente en el dashboard.');

      // 🎉 Mensaje final
      alert("✅ ¡Reserva creada exitosamente!");
      onSuccess();

    } catch (error) {
      console.error("Error al crear reserva:", error);
      alert("❌ Error al crear la reserva: " + error.message);
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
        <h2>Reservar {habitacion?.tipo}</h2>

        <div className="habitacion-info-box">
          <p><strong>Tipo:</strong> {habitacion?.badge || "Standard"}</p>
          <p><strong>Precio por noche:</strong> ${habitacion?.precio_por_noche}</p>
          <p><strong>Capacidad:</strong> {habitacion?.capacidad} Huéspedes</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fecha de Entrada *</label>
            <input
              type="date"
              value={formData.fecha_entrada}
              onChange={(e) => setFormData({ ...formData, fecha_entrada: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha de Salida *</label>
            <input
              type="date"
              value={formData.fecha_salida}
              onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value })}
              min={formData.fecha_entrada || new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Número de Huéspedes *</label>
            <input
              type="number"
              value={formData.numero_huespedes}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                // Validar que esté entre 1 y la capacidad máxima
                if (!isNaN(value) && value >= 1 && value <= (habitacion?.capacidad || 10)) {
                  setFormData({ ...formData, numero_huespedes: value });
                } else if (e.target.value === '') {
                  setFormData({ ...formData, numero_huespedes: 1 });
                }
              }}
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
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows="3"
              placeholder="Solicitudes especiales, preferencias, etc."
            ></textarea>
          </div>

          {precioTotal > 0 && (
            <div className="precio-total-box">
              <h3>Total: ${precioTotal}</h3>
              <small>
                {Math.ceil(
                  (new Date(formData.fecha_salida) - new Date(formData.fecha_entrada)) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                noche(s) × ${habitacion?.precio_por_noche}
              </small>
            </div>
          )}

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Procesando..." : "Confirmar Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalReservaHabitacion;