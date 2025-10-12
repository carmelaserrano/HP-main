import React from 'react'
import '../ESTILOS/Actividades.css'
import '../ESTILOS/SobreNosotros.css'
import { useTranslation } from 'react-i18next'

function Actividades() {
  const { t } = useTranslation();
  const galleryImages = [
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=900&fit=crop",
  ]
  return (
    <div className="actividades-page">
      <header className="actividades-header">
        <h1>{t('actividades.title')}</h1>
        <p>{t('actividades.subtitle')}</p>
      </header>
      {/*<div className="sobre-conteiner">
        <p>{t('actividades.intro')}</p>
      </div>*/}

      <section className="historia-section">
        <div className="historia-content">
          <div className="historia-text">
            <span className="section-label">ACTIVIDADES</span>
            <h2>{t('actividades.h2')}</h2>
            <div className="timeline-content">
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-spa"></i>
                </div>
                <p>{t('actividades.intro1')}</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-leaf"></i>
                </div>
                <p>{t('actividades.intro2')}</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-water"></i>
                </div>
                <p>{t('actividades.intro3')}</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-user-friends"></i>
                </div>
                <p>{t('actividades.intro4')}</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-infinity"></i>
                </div>
                <p>{t('actividades.intro5')}</p>
              </div>
            </div>
          </div>
          
          <div className="video-section">
            <video className="video-video" autoPlay muted loop>
          <source src="../recursos/VIDEOS/act_video.mp4" type="video/mp4" />
        </video>
          </div>
        </div>
      </section>

      {/* Activities Section */}
        <section className="services-section">
          <span className="section-label">{t('actividades.label1')}</span>
          <h2>{t('actividades.label2')}</h2>
          <div className="services-grid">
            <div className="service-card">
              <i className="fas fa-volleyball-ball service-icon"></i>
              <h3>{t('actividades.activity1')}</h3>
              <ul className="act-lista"> 
                <li>{t('actividades.text1a')}</li> 
                <li>{t('actividades.text1b')}</li> 
                <li>{t('actividades.text1c')}</li> 
                <li>{t('actividades.text1d')}</li> 
                <li>{t('actividades.text1e')}</li> 
              </ul> 
            </div>
            <div className="service-card">
              <i className="fas fa-theater-masks service-icon"></i>
              <h3>{t('actividades.activity2')}</h3>
              <ul className="act-lista"> 
                <li>{t('actividades.text2a')}</li> 
                <li>{t('actividades.text2b')}</li> 
                <li>{t('actividades.text2c')}</li> 
                <li>{t('actividades.text2d')}</li> 
                <li>{t('actividades.text2e')}</li> 
              </ul> 
            </div>
            <div className="service-card">
              <i className="fas fa-spa service-icon"></i>
              <h3>{t('actividades.activity3')}</h3>
              <ul className="act-lista"> 
                <li>{t('actividades.text3a')}</li> 
                <li>{t('actividades.text3b')}</li> 
                <li>{t('actividades.text3c')}</li> 
                <li>{t('actividades.text3d')}</li> 
              </ul> 
            </div>
          </div>
          <div className="services-grid2">
            <div className="service-card">
              <i className="fas fa-users service-icon"></i>
              <h3>{t('actividades.activity4')}</h3>
              <ul className="act-lista"> 
                <li>{t('actividades.text4a')}</li> 
                <li>{t('actividades.text4b')}</li> 
                <li>{t('actividades.text4c')}</li> 
              </ul> 
            </div>
            <div className="service-card">
              <i className="fas fa-wine-glass-alt service-icon"></i>
              <h3>{t('actividades.activity5')}</h3>
              <ul className="act-lista"> 
                <li>{t('actividades.text5a')}</li> 
                <li>{t('actividades.text5b')}</li> 
                <li>{t('actividades.text5c')}</li> 
                <li>{t('actividades.text5d')}</li> 
              </ul> 
            </div>
          </div>
        
        </section>


    </div>
    
  );
}

export default Actividades;
