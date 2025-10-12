  import '../ESTILOS/Home.css'
  import { useTranslation } from 'react-i18next'
  import { useNavigate } from 'react-router-dom'

  function Home() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    return (
      <div>
        <div className="hero-section">
        <video className="hero-video" autoPlay muted loop>
          <source src="../recursos/VIDEOS/videoprincipal.mp4" type="video/mp4" />
        </video>

        <div className="hero-content">
          {/* Texto a la izquierda */}
          <div className="hero-text">
            <h1 className="hero-title">{t('home.heroTitle')}</h1>
            <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
          </div>

          {/* Formulario de reservas a la derecha */}
          <div className="booking-panel">
            <h3 className="booking-title">{t('home.bookingTitle')}</h3>

            <div className="form-group">
              <label>{t('home.checkIn')}</label>
              <input type="date" className="form-input" />
            </div>

            <div className="form-group">
              <label>{t('home.checkOut')}</label>
              <input type="date" className="form-input" />
            </div>

            <div className="form-group">
              <label>{t('home.guests')}</label>
              <select className="form-input">
                <option>2 {t('home.adults')}</option>
                <option>1 {t('home.adult')}</option>
                <option>3 {t('home.adults')}</option>
                <option>4+ {t('home.adults')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('home.room')}</label>
              <select className="form-input">
                <option>1 {t('home.room')}</option>
                <option>2 {t('home.rooms')}</option>
                <option>3 {t('home.rooms')}</option>
                <option>4+ {t('home.rooms')}</option>
              </select>
            </div>

            <button className="btn-check-availability">{t('home.checkAvailability')}</button>
          </div>
        </div>
        </div>

        {/* About Us Section */}
        <section className="about-section">
          <div className="about-container">
            <div className="about-text">
              <span className="section-label">{t('home.aboutLabel')}</span>
              <h2>{t('home.aboutTitle')}</h2>
              <p>{t('home.aboutText1')}</p>
              <p>{t('home.aboutText2')}</p>
              <button className="btn-read-more" onClick={() => navigate('/sobre-nosotros')}>{t('home.readMore')}</button>
            </div>
            <div className="about-images">
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400" alt="Hotel exterior" />
              <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400" alt="Hotel interior" />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section">
          <span className="section-label">{t('home.servicesLabel')}</span>
          <h2>{t('home.servicesTitle')}</h2>
          <div className="services-grid">
            <div className="service-card">
              <i className="fas fa-dumbbell service-icon"></i>
              <h3>{t('home.gym')}</h3>
              <p>{t('home.gymDesc')}</p>
            </div>
            <div className="service-card">
              <i className="fas fa-utensils service-icon"></i>
              <h3>{t('home.cateringService')}</h3>
              <p>{t('home.cateringDesc')}</p>
            </div>
            <div className="service-card">
              <i className="fas fa-spa service-icon"></i>
              <h3>{t('home.spa')}</h3>
              <p>{t('home.spaDesc')}</p>
            </div>
          </div>
        </section>

        {/* Rooms Preview Section */}
        <section className="rooms-preview">
          <div className="rooms-header-section">
            <span className="section-label">NUESTRAS HABITACIONES</span>
            <h2>Confort y Elegancia</h2>
            <p className="rooms-subtitle">Descubre nuestras exclusivas habitaciones con vista al mar</p>
          </div>
          <div className="rooms-grid">
            <div className="room-card">
              <div className="room-image-container">
                <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80" alt="Double Room" />
                <div className="room-hover-overlay">
                  <ul className="room-amenities-hover">
                    <li><i className="fas fa-wifi"></i> WiFi gratis</li>
                    <li><i className="fas fa-tv"></i> TV Smart 50"</li>
                    <li><i className="fas fa-snowflake"></i> Aire acondicionado</li>
                    <li><i className="fas fa-concierge-bell"></i> Room service</li>
                  </ul>
                  <button className="btn-view-room" onClick={() => navigate('/habitaciones')}>
                    Ver más
                  </button>
                </div>
              </div>
              <div className="room-info">
                <span className="room-category">OCEAN VIEW</span>
                <h3>{t('home.doubleRoom')}</h3>
                <p className="room-description">Vista panorámica al océano con balcón privado</p>
                <p className="room-price">$199 <span>{t('home.perNight')}</span></p>
              </div>
            </div>

            <div className="room-card">
              <div className="room-image-container">
                <img src="https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&q=80" alt="Premium King Room" />
                <div className="room-hover-overlay">
                  <ul className="room-amenities-hover">
                    <li><i className="fas fa-wifi"></i> WiFi gratis</li>
                    <li><i className="fas fa-tv"></i> TV Smart 55"</li>
                    <li><i className="fas fa-hot-tub"></i> Jacuzzi</li>
                    <li><i className="fas fa-concierge-bell"></i> Room service 24/7</li>
                  </ul>
                  <button className="btn-view-room" onClick={() => navigate('/habitaciones')}>
                    Ver más
                  </button>
                </div>
              </div>
              <div className="room-info">
                <span className="room-category">PREMIUM</span>
                <h3>{t('home.premiumKing')}</h3>
                <p className="room-description">Suite king con jacuzzi y terraza privada</p>
                <p className="room-price">$159 <span>{t('home.perNight')}</span></p>
              </div>
            </div>

            <div className="room-card">
              <div className="room-image-container">
                <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80" alt="Deluxe Room" />
                <div className="room-hover-overlay">
                  <ul className="room-amenities-hover">
                    <li><i className="fas fa-wifi"></i> WiFi gratis</li>
                    <li><i className="fas fa-tv"></i> TV Smart 65"</li>
                    <li><i className="fas fa-couch"></i> Sala de estar</li>
                    <li><i className="fas fa-utensils"></i> Cocina pequeña</li>
                  </ul>
                  <button className="btn-view-room" onClick={() => navigate('/habitaciones')}>
                    Ver más
                  </button>
                </div>
              </div>
              <div className="room-info">
                <span className="room-category">DELUXE</span>
                <h3>{t('home.deluxeRoom')}</h3>
                <p className="room-description">Suite de lujo con sala de estar y cocina</p>
                <p className="room-price">$198 <span>{t('home.perNight')}</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <span className="section-label">{t('home.testimonialsLabel')}</span>
          <h2>{t('home.testimonialsTitle')}</h2>

          <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
              <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="0" className="active"></button>
              <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="1"></button>
              <button type="button" data-bs-target="#testimonialCarousel" data-bs-slide-to="2"></button>
            </div>

            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="testimonial-card">
                  <p className="testimonial-text">"{t('home.testimonialText')}"</p>
                  <div className="testimonial-rating">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="testimonial-author">{t('home.testimonialAuthor')}</p>
                  <img src="https://cdn.worldvectorlogo.com/logos/tripadvisor-1.svg" alt="TripAdvisor" className="tripadvisor-logo" />
                </div>
              </div>

              <div className="carousel-item">
                <div className="testimonial-card">
                  <p className="testimonial-text">"La experiencia fue increíble. El personal es muy atento, las instalaciones están impecables y la ubicación es perfecta. Sin duda volveremos pronto. ¡Altamente recomendado!"</p>
                  <div className="testimonial-rating">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="testimonial-author">- María González</p>
                  <img src="https://cdn.worldvectorlogo.com/logos/tripadvisor-1.svg" alt="TripAdvisor" className="tripadvisor-logo" />
                </div>
              </div>

              <div className="carousel-item">
                <div className="testimonial-card">
                  <p className="testimonial-text">"Excelente hotel con vistas espectaculares. La habitación era espaciosa y muy cómoda. El desayuno buffet tenía una gran variedad de opciones. Una estadía memorable."</p>
                  <div className="testimonial-rating">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="testimonial-author">- John Smith</p>
                  <img src="https://cdn.worldvectorlogo.com/logos/tripadvisor-1.svg" alt="TripAdvisor" className="tripadvisor-logo" />
                </div>
              </div>
            </div>

            <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </div>
        </section>

      </div>
    )
  }

  export default Home