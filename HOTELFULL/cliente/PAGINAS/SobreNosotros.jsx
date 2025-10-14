import '../ESTILOS/SobreNosotros.css'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../COMPONENTES/PageTransition.jsx'

function SobreNosotros() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const galleryImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop"
  ];

  return (
    <PageTransition>
    <div className="sobre-nosotros-page">

      {/* Hero Header with Background Image */}
      <div className="sobre-hero-header">
        <div className="sobre-hero-overlay"></div>
        <div className="sobre-hero-content">
          <h1>{t('sobreNosotros.title')}</h1>
          <p className="sobre-hero-subtitle">{t('sobreNosotros.intro')}</p>
        </div>
      </div>

      {/* Historia Section - 2 Columns */}
      <section className="sobre-historia-section">
        <div className="sobre-historia-content">
          <div className="sobre-historia-text">
            <span className="section-label-sobre">{t('sobreNosotros.historyTitle')}</span>
            <h2>{t('sobreNosotros.historyTitle')}</h2>
            <div className="timeline-content">
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-flag"></i>
                </div>
                <p>{t('sobreNosotros.historyText1')}</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <p>{t('sobreNosotros.historyText2')}</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-hotel"></i>
                </div>
                <p>{t('sobreNosotros.historyText3')}</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-star"></i>
                </div>
                <p>{t('sobreNosotros.historyText4')}</p>
              </div>
              <div className="timeline-item">
                <div className="timeline-marker">
                  <i className="fas fa-heart"></i>
                </div>
                <p>{t('sobreNosotros.historyText5')}</p>
              </div>
            </div>
          </div>
          <div className="sobre-historia-image">
            <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=900&fit=crop" alt="Hotel" />
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="sobre-stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="stat-number">2000+</h3>
            <p className="stat-label">{t('sobreNosotros.text1')}</p>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-award"></i>
            </div>
            <h3 className="stat-number">15</h3>
            <p className="stat-label">{t('sobreNosotros.text2')}</p>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-star"></i>
            </div>
            <h3 className="stat-number">95%</h3>
            <p className="stat-label">{t('sobreNosotros.text3')}</p>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <h3 className="stat-number">12</h3>
            <p className="stat-label">{t('sobreNosotros.text4')}</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="sobre-why-section">
        <div className="sobre-why-content">
          <span className="section-label-sobre">{t('sobreNosotros.reasons')}</span>
          <h2>{t('sobreNosotros.whyTitle')}</h2>

          <div className="reasons-grid">
            <div className="reason-item">
              <div className="reason-icon">
                <i className="fas fa-tags"></i>
              </div>
              <div className="reason-text">
                <h3>{t('sobreNosotros.reason1')}</h3>
                <div className="reason-line"></div>
              </div>
            </div>

            <div className="reason-item">
              <div className="reason-icon">
                <i className="fas fa-utensils"></i>
              </div>
              <div className="reason-text">
                <h3>{t('sobreNosotros.reason2')}</h3>
                <div className="reason-line"></div>
              </div>
            </div>

            <div className="reason-item">
              <div className="reason-icon">
                <i className="fas fa-swimming-pool"></i>
              </div>
              <div className="reason-text">
                <h3>{t('sobreNosotros.reason3')}</h3>
                <div className="reason-line"></div>
              </div>
            </div>

            <div className="reason-item">
              <div className="reason-icon">
                <i className="fas fa-spa"></i>
              </div>
              <div className="reason-text">
                <h3>{t('sobreNosotros.reason4')}</h3>
                <div className="reason-line"></div>
              </div>
            </div>

            <div className="reason-item">
              <div className="reason-icon">
                <i className="fas fa-wifi"></i>
              </div>
              <div className="reason-text">
                <h3>{t('sobreNosotros.reason5')}</h3>
                <div className="reason-line"></div>
              </div>
            </div>
          </div>

          <p className="sobre-closing">{t('sobreNosotros.closing')}</p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="sobre-gallery-section">
        <span className="section-label-sobre">{t('sobreNosotros.galleryTitle')}</span>
        <h2>{t('sobreNosotros.gallerySubtitle')}</h2>
        <div className="gallery-grid">
          {galleryImages.map((img, index) => (
            <div key={index} className="gallery-item">
              <img src={img} alt={`Gallery ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="sobre-cta-section">
        <div className="cta-content">
          <h2>{t('sobreNosotros.ready')}</h2>
          <p>{t('sobreNosotros.book')}</p>
          <div className="cta-buttons">
            <button className="btn-cta-primary" onClick={() => navigate('/habitaciones')}>
              {t('sobreNosotros.rooms')}
            </button>
            <button className="btn-cta-secondary" onClick={() => navigate('/contacto')}>
              {t('sobreNosotros.contact')}
            </button>
          </div>
        </div>
      </section>

    </div>
    </PageTransition>
  );
}

export default SobreNosotros;