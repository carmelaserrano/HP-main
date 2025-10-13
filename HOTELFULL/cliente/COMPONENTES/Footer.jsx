import '../ESTILOS/Footer.css'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Footer({ onPageChange }) {
   const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="container-fluid px-5">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="footer-brand">
              <img src="../recursos/LOGOS/logo1.png" alt="Isla bella" className="footer-logo mb-3" />
              <p className="footer-description">{t('footer.description')}</p>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 mb-4">
            <h5 className="footer-title">{t('footer.titleh5')}</h5>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">{t("footer.link1")}</Link></li>
        <li><Link to="/restaurantes" className="footer-link">{t("footer.link3")}</Link></li>
        <li><Link to="/habitaciones" className="footer-link">{t("footer.link2")}</Link></li>
        <li><Link to="/servicios" className="footer-link">{t("footer.link4")}</Link></li>
        <li><Link to="/actividades" className="footer-link">{t("footer.link5")}</Link></li>
        <li><Link to="/sobre-nosotros" className="footer-link">{t("footer.link6")}</Link></li>
        <li><Link to="/contacto" className="footer-link">{t("footer.link7")}</Link></li>
      </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="footer-title">{t('footer.subTitle1')}</h5>
            <div className="footer-contact">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt me-2"></i>
                <span>1 Knights Keyy Boulevard, MM 47 Marathon, FL 33050</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone me-2"></i>
                <span>1-800-405-1948</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope me-2"></i>
                <span>hotelislabella25@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="footer-title">{t('footer.subTitle2')}</h5>
            <div className="social-links">
              <a href="https://www.facebook.com/100070195716996/photos/837817751901408/" className="social-link">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/islabellabeachresort/?hl=es" className="social-link">
                <i className="fab fa-instagram"></i>
              </a>

            </div>
            {/*<div className="newsletter mt-3">
              <p className="newsletter-text">{t('footer.message1')}</p>
              <div className="input-group">
                <input type="email" className="form-control newsletter-input" placeholder="Tu email" />
                <button className="btn newsletter-btn" type="button">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </div>*/}
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="row footer-bottom">
          <div className="col-md-6">
            <p className="copyright">{t('footer.message2')}</p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="footer-legal">
              <a href="#" className="legal-link">{t('footer.message3')}</a>
              <span className="mx-2">|</span>
              <a href="#" className="legal-link">{t('footer.message4')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}