import '../ESTILOS/Navbar.css'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  return (
    <>
      {/* Top bar con información de contacto */}
      <div className="top-bar">
        <div className="top-bar-container">
          <div className="contact-info">
            <span className="phone"><i className="fas fa-phone-alt"></i> 1-800-405-1948</span>
            <span className="email"><i className="fas fa-envelope"></i> hotelislabella25@gmail.com</span>
          </div>
          <div className="social-icons">
            <a href="https://www.facebook.com/IslaBellaBeachResort/"><i className="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/islabellabeachresort/?hl=es"><i className="fab fa-instagram"></i></a>
          </div>
          {/*<button className="btn-cta-secondary">{t('navbar.bookNow')}</button>*/}
          <button className="btn-booking-top" onClick={() => navigate('/login')}>LOGIN</button>
        </div>
      </div>

      {/* Navbar principal */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo y nombre */}
          <div className="navbar-brand">
            <img src="../recursos/LOGOS/logo1.png" alt="Isla bella" className="navbar-logo" />
          </div>

          {/* Botón hamburguesa visible solo en mobile */}
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className="fas fa-bars"></i>
          </button>

          {/* Links de navegación */}
          <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <li><Link to="/">{t('navbar.home')}</Link></li>
            <li><Link to="/habitaciones">{t('navbar.rooms')}</Link></li>
            <li><Link to="/restaurantes">{t('navbar.restaurants')}</Link></li>
            <li><Link to="/actividades">{t('navbar.activities')}</Link></li>
            <li><Link to="/servicios">{t('navbar.services')}</Link></li>
            <li><Link to="/sobre-nosotros">{t('navbar.about')}</Link></li>
            <li><Link to="/contacto">{t('navbar.contact')}</Link></li>
          </ul>

          {/* Selector de idioma en navbar */}
          <div className="language-selector-navbar">
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="language-dropdown"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
