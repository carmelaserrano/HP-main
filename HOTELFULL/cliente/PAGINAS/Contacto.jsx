import '../ESTILOS/Contacto.css'
import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { useTranslation } from 'react-i18next'

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

  return (
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

          {/* Mapa y información */}
          <div className="contact-info-section">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56883.77401460904!2d-81.14457959321989!3d24.714790935875975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d0de5f36dfc985%3A0x9b33a2bc9ce2b217!2sIsla%20Bella%20Beach%20Resort%20%26%20Spa!5e0!3m2!1ses!2sar!4v1759528474731!5m2!1ses!2sar"
                width="100%"
                height="300"
                allowFullScreen=""
                loading="lazy"
                title="Ubicación del hotel"
              ></iframe>
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


    </div>
  )
}

export default Contacto
