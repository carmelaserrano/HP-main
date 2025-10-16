import { supabase } from './supabaseClient';

// Obtener todas las habitaciones
export const obtenerHabitaciones = async () => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('*')
      .order('numero', { ascending: true });

    if (error) {
      console.error('Error al obtener habitaciones:', error.message);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error inesperado:', error);
    return [];
  }
};

// Obtener una habitación por ID
export const obtenerHabitacionPorId = async (id) => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener habitación:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error inesperado:', error);
    return null;
  }
};

// Actualizar estado de una habitación
export const actualizarEstadoHabitacion = async (id, nuevoEstado) => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .update({ estado: nuevoEstado })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al actualizar estado:', error.message);
      return null;
    }
    return data?.[0] || null;
  } catch (error) {
    console.error('Error inesperado:', error);
    return null;
  }
};

// Actualizar cualquier campo de una habitación
export const actualizarHabitacion = async (id, datosActualizar) => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .update(datosActualizar)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al actualizar habitación:', error.message);
      return null;
    }
    return data?.[0] || null;
  } catch (error) {
    console.error('Error inesperado:', error);
    return null;
  }
};

// Agregar nueva habitación
export const agregarNuevaHabitacion = async (
  numero,
  tipo,
  capacidad,
  precio_por_noche,
  descripcion = ''
) => {
  try {
    // Validar que el número no exista ya
    const { data: existe } = await supabase
      .from('habitaciones')
      .select('id')
      .eq('numero', numero)
      .single();

    if (existe) {
      console.error('Ya existe una habitación con ese número');
      return null;
    }

    const { data, error } = await supabase
      .from('habitaciones')
      .insert([
        {
          numero: parseInt(numero),
          tipo,
          capacidad: parseInt(capacidad),
          precio_por_noche: parseFloat(precio_por_noche),
          descripcion,
          estado: 'DISPONIBLE'
        }
      ])
      .select();

    if (error) {
      console.error('Error al agregar habitación:', error.message);
      return null;
    }
    return data?.[0] || null;
  } catch (error) {
    console.error('Error inesperado:', error);
    return null;
  }
};

// Eliminar habitación
export const eliminarHabitacion = async (id) => {
  try {
    const { error } = await supabase
      .from('habitaciones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar habitación:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    return false;
  }
};

// Obtener habitaciones disponibles
export const obtenerHabitacionesDisponibles = async () => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('*')
      .eq('estado', 'DISPONIBLE')
      .order('numero', { ascending: true });

    if (error) {
      console.error('Error al obtener habitaciones disponibles:', error.message);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error inesperado:', error);
    return [];
  }
};

// Obtener habitaciones por estado
export const obtenerHabitacionesPorEstado = async (estado) => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('*')
      .eq('estado', estado)
      .order('numero', { ascending: true });

    if (error) {
      console.error('Error al obtener habitaciones por estado:', error.message);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Error inesperado:', error);
    return [];
  }
};

// Obtener estadísticas de habitaciones
export const obtenerEstadisticasHabitaciones = async () => {
  try {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('estado');

    if (error) {
      console.error('Error al obtener estadísticas:', error.message);
      return null;
    }

    const stats = {
      total: data.length,
      disponibles: data.filter(h => h.estado === 'DISPONIBLE').length,
      ocupadas: data.filter(h => h.estado === 'OCUPADA').length,
      mantenimiento: data.filter(h => h.estado === 'MANTENIMIENTO').length
    };

    return stats;
  } catch (error) {
    console.error('Error inesperado:', error);
    return null;
  }
}