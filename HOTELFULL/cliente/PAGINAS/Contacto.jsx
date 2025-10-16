import '../ESTILOS/Contacto.css'
import { useState, useEffect} from 'react'
import emailjs from '@emailjs/browser'
import { useTranslation } from 'react-i18next'
import PageTransition from '../COMPONENTES/PageTransition.jsx'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import Weather from "../COMPONENTES/Weather.jsx";

function Contacto() {
  const { t } = useTranslation();
  const [mensaje, setMensaje] = useState('');
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Enviar el formulario con EmailJS
    emailjs.sendForm('service_p3xat2f', 'template_n0ibnip', e.target, 'yGthoCh6oDPKXPBEg')
      .then((result) => {
        console.log('Email enviado:', result.text);
        setMensaje(t('contacto.successMessage'));
        setMostrarMensaje(true);
        e.target.reset();

        setTimeout(() => {
          setMostrarMensaje(false);
        }, 10000);
      })
      .catch((error) => {
        console.error('Error al enviar:', error.text);
        setMensaje(t('contacto.errorMessage'));
        setMostrarMensaje(true);

        setTimeout(() => {
          setMostrarMensaje(false);
        }, 10000);
      });
  };
  // 📍 Coordenadas del hotel 
  const hotelUbicacion = { lat: 24.7070, lng: -81.1201 };

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '12px'
  };

  const mapOptions = {
    zoom: 15,
    center: hotelUbicacion,
    disableDefaultUI: false,
  };
  


  return (
     <PageTransition>
    <div className="contacto-page">
      {/* Hero section */}
      <div className="contact-hero">
        <h1>{t('contacto.title')}</h1>
      </div>

      {/* Contenido principal */}
      <div className="contact-container">
        <div className="contact-content">
          {/* Formulario */}
          <div className="contact-form-section">
            <h2>{t('contacto.formTitle')}</h2>
            {mostrarMensaje && (
              <div className="success-message">
                {mensaje}
              </div>
            )}
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label>{t('contacto.name')}</label>
                <input
                  type="text"
                  name="from_name"
                  placeholder={t('contacto.namePlaceholder')}
                  pattern='^[A-Za-zÀ-ÖØ-öø-ÿ\s]+'
                  title='El nombre solo puede contener letras y espacios'
                  required
                />
              </div>

              <div className="form-field">
                <label>{t('contacto.email')}</label>
                <input
                  type="email"
                  name="from_email"
                  placeholder={t('contacto.emailPlaceholder')}
                  pattern='^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\'
                  title='El email debe tener un formato válido'
                  required
                />
              </div>

              <div className="form-field">
                <label>{t('contacto.subject')}</label>
                <input
                  type="text"
                  name="title"
                  placeholder={t('contacto.subjectPlaceholder')}
                  required
                />
              </div>

              <div className="form-field">
                <label>{t('contacto.message')}</label>
                <textarea
                  name="message"
                  rows="6"
                  placeholder={t('contacto.messagePlaceholder')}
                  minLength={10}
                  maxLength={500}
                  title='El mensaje debe tener entre 10 y 500 caracteres'
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-send">{t('contacto.send')}</button>
            </form>
          </div>

             {/* 🗺️ Mapa con Google Maps API */}
            <div className="contact-info-section">
              <div className="map-container">
                <LoadScript googleMapsApiKey="AIzaSyCi4kNgfdXUOFezo1mcRUwbkKDjz33nKIY">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    {...mapOptions}
                  >
                    <Marker position={hotelUbicacion} />
                  </GoogleMap>
                </LoadScript>
              </div>

            <div className="contact-details">
              <div className="detail-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h4>{t('contacto.address')}</h4>
                  <p>{t('contacto.addressText')}</p>
                </div>
              </div>

              <div className="detail-item">
                <i className="fas fa-phone-alt"></i>
                <div>
                  <h4>{t('contacto.phone')}</h4>
                  <p>{t('contacto.phoneNumber')}</p>
                </div>
              </div>

              <div className="detail-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h4>{t('contacto.emailLabel')}</h4>
                  <p>{t('contacto.emailAddress')}</p>
                </div>
              </div>

              <div className="detail-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h4>{t('contacto.hours')}</h4>
                  <p>{t('contacto.hoursText')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Weather />


    </div>
     </PageTransition>
  )
}

export default Contacto
