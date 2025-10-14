import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import '../ESTILOS/Servicios.css'
import { useTranslation } from 'react-i18next'
import PageTransition from '../COMPONENTES/PageTransition.jsx'

// boto de reservar que abre un formulario modal para reservar el servicio seleccionado



// estado que guarda UN SOLO servicio seleccionado
const Servicios = () => {
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setMessage('');


    // Cuando haces clic en "Gimnasio Premium", se guarda en selectedService, y luego cuando envías el formulario, selectedService.titulo toma ese valor ("Gimnasio Premium") y lo incluye en los datos que se envían por EmailJS.
    const templateParams = {
      servicio: selectedService.titulo,
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      fecha: formData.fecha,
      personas: formData.personas,
      mensaje: formData.mensaje
    };

    emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      templateParams,
      'YOUR_PUBLIC_KEY'
    )
    .then(() => {
      setMessage('¡Reserva enviada exitosamente! Te contactaremos pronto.');
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        fecha: '',
        personas: '',
        mensaje: ''
      });
      setTimeout(() => {
        setShowForm(false);
        setSelectedService(null);
        setMessage('');
      }, 3000);
    })
    .catch(() => {
      setMessage('Error al enviar la reserva. Por favor intenta nuevamente.');
    })
    .finally(() => {
      setSending(false);
    });
  };

  // datos de los servicios
    const servicios = [
    {
    id: 1,
    titulo: t('servicios.items.1.titulo'),
    descripcion: t('servicios.items.1.descripcion'),
    detalles: t('servicios.items.1.detalles'),
    imagen: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop"
    },
    {
    id: 2,
    titulo: t('servicios.items.2.titulo'),
    descripcion: t('servicios.items.2.descripcion'),
    detalles: t('servicios.items.2.detalles'),
    imagen: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop"
    },
    {
    id: 3,
    titulo: t('servicios.items.3.titulo'),
    descripcion: t('servicios.items.3.descripcion'),
    detalles: t('servicios.items.3.detalles'),
    imagen: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&h=400&fit=crop"
    },
    {
    id: 4,
    titulo: t('servicios.items.4.titulo'),
    descripcion: t('servicios.items.4.descripcion'),
    detalles: t('servicios.items.4.detalles'),
    imagen: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop"
    },
    {
    id: 5,
    titulo: t('servicios.items.5.titulo'),
    descripcion: t('servicios.items.5.descripcion'),
    detalles: t('servicios.items.5.detalles'),
    imagen: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"
    },
    {
    id: 6,
    titulo: t('servicios.items.6.titulo'),
    descripcion: t('servicios.items.6.descripcion'),
    detalles: t('servicios.items.6.detalles'),
    imagen: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop"
    }
  ];

  return (
    <PageTransition>
    <div className="servicios-page">
      <div className="servicios-header">
        <h1>{t('servicios.title')}</h1>
        <p>{t('servicios.subtitle')}</p>
      </div>

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


{/* si selected service tiene un valor osea no es 0 renderisa el modal . cuando puse el formulario agregue showform*/}
      {selectedService && !showForm && (

        <div className="modal" onClick={() => setSelectedService(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedService(null)}>×</button>
            <img src={selectedService.imagen} alt={selectedService.titulo} />
            <h2>{selectedService.titulo}</h2>
            <p className="descripcion">{selectedService.descripcion}</p>
            <p className="detalles">{selectedService.detalles}</p>
            <button className="reservar-btn" onClick={() => setShowForm(true)}>{t('servicios.reservar')}</button>
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
                  placeholder="Requisitos especiales, alergias, etc."
                />
              </div>

              {message && <p className={`form-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}

              <button type="submit" className="reservar-btn" disabled={sending}>
                {sending ? 'Enviando...' : 'Confirmar Reserva'}
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
