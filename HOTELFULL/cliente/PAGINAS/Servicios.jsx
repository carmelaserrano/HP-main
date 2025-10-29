import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient';
import emailjs from '@emailjs/browser';
import '../ESTILOS/Servicios.css'
import { useTranslation } from 'react-i18next'
import PageTransition from '../COMPONENTES/PageTransition.jsx'

// boto de reservar que abre un formulario modal para reservar el servicio seleccionado



// estado que guarda UN SOLO servicio seleccionado
const Servicios = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [servicios, setServicios] = useState([]); // ← Ahora servicios se cargan dinámicamente
  const [loading, setLoading] = useState(true); // ← Para mostrar estado de carga
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    personas: '',
    mensaje: ''
  });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const formRef = useRef();

  // Cargar servicios desde Supabase
  useEffect(() => {
    const loadServicios = async () => {
      try {
        const { data, error } = await supabase
          .from('servicios_extras')
          .select('*')
          .eq('disponible', true) // Solo servicios disponibles
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Mapear los datos de Supabase al formato que espera el componente
        const serviciosMapeados = data.map((serv, index) => ({
          id: serv.id,
          titulo: serv.nombre,
          descripcion: serv.descripcion || t('servicios.defaultDescription'),
          detalles: serv.descripcion || t('servicios.defaultDetails'),
          precio: serv.precio,
          // Usar la primera imagen del servicio si existe, sino usar Unsplash
          imagen: serv.imagenes && serv.imagenes.length > 0
            ? serv.imagenes[0]
            : `https://images.unsplash.com/photo-${getImageId(index)}?w=600&h=400&fit=crop`
        }));

        setServicios(serviciosMapeados);
      } catch (error) {
        console.error(t('servicios.errorLoading'), error);
      } finally {
        setLoading(false);
      }
    };

    loadServicios();
  }, []);

  // Función auxiliar para obtener IDs de imágenes de Unsplash
  const getImageId = (index) => {
    const imageIds = [
      '1414235077428-338989a2e8c0', // Restaurante
      '1540555700478-4be289fbecef', // Spa
      '1575429198097-0414ec08e8cd', // Piscina
      '1534438327276-14e5300c3a48', // Gimnasio
      '1566073771259-6a8506099945', // Room Service
      '1544551763-46a013bb70d5'  // Tours
    ];
    return imageIds[index % imageIds.length];
  };

  // Verificar si el usuario está logueado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  const handleReservarClick = async () => {
    // Verificar si está logueado
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // No está logueado → redirigir al login
      navigate('/login');
      return;
    }

    // Está logueado → mostrar formulario
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validación en tiempo real para nombre (solo letras y espacios)
    if (name === 'nombre') {
      if (value === '' || /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }

    // Validación en tiempo real para teléfono (solo números, espacios, guiones y paréntesis)
    if (name === 'telefono') {
      if (value === '' || /^[\d\s\-()]+$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }

    // Para otros campos, actualizar normalmente
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage('');

    // Validar nombre (solo letras y espacios)
    const nombreRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!nombreRegex.test(formData.nombre)) {
      setMessage(t('servicios.errorName'));
      setSending(false);
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage(t('servicios.errorEmail'));
      setSending(false);
      return;
    }

    // Validar teléfono (solo números, espacios, guiones y paréntesis)
    const telefonoRegex = /^[\d\s\-()]+$/;
    if (!telefonoRegex.test(formData.telefono)) {
      setMessage(t('servicios.errorPhone'));
      setSending(false);
      return;
    }

    try {
      // Obtener usuario actual
      const { data: { session } } = await supabase.auth.getSession();

      // Guardar reserva en la base de datos
      const { data: reservaData, error: reservaError } = await supabase
        .from('reserva_servicio')
        .insert([{
          servicio_id: selectedService.id,
          usuario_id: session?.user?.id,
          fecha: formData.fecha,
          cantidad_personas: parseInt(formData.personas),
          estado: 'pendiente',
          nombre_cliente: formData.nombre,
          email_cliente: formData.email,
          telefono_cliente: formData.telefono,
          notas: formData.mensaje
        }])
        .select();

      if (reservaError) {
        console.error('Error al guardar reserva:', reservaError);
        setMessage(t('servicios.errorCreate'));
        setSending(false);
        return;
      }

      // Mostrar mensaje de éxito
      setMessage(t('servicios.success'));

      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        fecha: '',
        personas: '',
        mensaje: ''
      });

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowForm(false);
        setSelectedService(null);
        setMessage('');
      }, 2000);

    } catch (error) {
      console.error('Error completo:', error);
      setMessage(t('servicios.errorCreate'));
    } finally {
      setSending(false);
    }
  };

  return (
    <PageTransition>
    <div className="servicios-page">
      <div className="servicios-header">
        <h1>{t('servicios.title')}</h1>
        <p>{t('servicios.subtitle')}</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>{t('servicios.loading')}</p>
        </div>
      ) : servicios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>{t('servicios.noServices')}</p>
        </div>
      ) : (
        <div className="servicios-grid">
          {servicios.map((servicio) => (
          <div
            key={servicio.id}
            className="servicio-card"


            // servicio es el servicio individual que se esta mapeando
            onClick={() => setSelectedService(servicio)}
          >
            <div className="servicio-imagen">
              <img src={servicio.imagen} alt={servicio.titulo} />
              <div className="servicio-overlay">
                <button>{t('servicios.details')}</button>
              </div>
            </div>
            <div className="servicio-info">
              <h3>{servicio.titulo}</h3>
              <p>{servicio.descripcion}</p>
            </div>
          </div>
        ))}
        </div>
      )}


{/* si selected service tiene un valor osea no es 0 renderisa el modal . cuando puse el formulario agregue showform*/}
      {selectedService && !showForm && (

        <div className="modal" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedService(null)}>×</button>
            <img src={selectedService.imagen} alt={selectedService.titulo} />
            <h2>{selectedService.titulo}</h2>
            <p className="detalles">{selectedService.detalles}</p>
            <button className="reservar-btn" onClick={handleReservarClick}>{t('servicios.reservar')}</button>
          </div>
        </div>
      )}

      {selectedService && showForm && (
        <div className="modal" onClick={() => { setShowForm(false); setSelectedService(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => { setShowForm(false); setSelectedService(null); }}>×</button>
            <h2>Reservar {selectedService.titulo}</h2>

            <form ref={formRef} onSubmit={handleSubmit} className="reserva-form">
              <div className="form-group">
                <label htmlFor="nombre">{t('servicios.name')}</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('servicios.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">{t('servicios.phone')}</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fecha">{t('servicios.date')}</label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="personas">{t('servicios.people')}</label>
                  <input
                    type="number"
                    id="personas"
                    name="personas"
                    min="1"
                    value={formData.personas}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">{t('servicios.message')}</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows="4"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  placeholder={t('servicios.placeholder')}
                />
              </div>

              {message && <p className={`form-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}

              <button type="submit" className="reservar-btn" disabled={sending}>
                {sending ?  t('servicios.sending') : t('servicios.confirm')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  )
}

export default Servicios;

// agregar footer y agregar efecto al titulo 
