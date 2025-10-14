import '../ESTILOS/Restaurantes.css'
import React from 'react'
import { useTranslation } from 'react-i18next'
import PageTransition from '../COMPONENTES/PageTransition.jsx'

function Restaurantes() {
  const { t } = useTranslation();
  const [currentImage, setCurrentImage] = React.useState(0);

  const images = [
    "/recursos/IMAGENES/restaurantes/chino.jpg",
    "/recursos/IMAGENES/restaurantes/buffet.jpg",
    "/recursos/IMAGENES/restaurantes/italiano.jpg",
    "/recursos/IMAGENES/restaurantes/parrilla.jpg"
  ];


  return (
    <PageTransition>
    <div className="restaurantes-page">
      <div className="rest-header">
        <h1>{t('restaurantes.title')}</h1>
        <p>{t('restaurantes.subtitle')}</p>
      </div>

      <div className="container">
        <div className="rooms-grid">
          {/* Card 1 - Restaurante chino */}
            <div className="room-card">
            <div className="room-image-small">
              <img src={images[0]} alt="Vista interior Veranda King" />

            </div>
            <div className="room-info">
              <h3>{t('restaurantes.chinese')}</h3>
              <p className="room-description">
                {t('restaurantes.chineseDesc')}
              </p>
              <ul className="room-features">
                <li> {t('restaurantes.sushi')}</li>
                <li> {t('restaurantes.sweetSour')}</li>
                <li> {t('restaurantes.tempura')}</li>
                <li> {t('restaurantes.gohan')}</li>
                <li> {t('restaurantes.friedRice')}</li>
                <li> {t('restaurantes.soups')}</li>
                <li> {t('restaurantes.springRolls')}</li>
              </ul>
            </div>
          </div>

          {/* Card 2 - Restaurante Buffet */}
          <div className="room-card">
            <div className="room-image-small">
              <img src={images[1]} alt="Vista interior Veranda King" />
            </div>
            <div className="room-info">
              <h3>{t('restaurantes.buffet')}</h3>
              <p>{t('restaurantes.buffetDesc')}</p>
              <ul className="room-features">
                <li> {t('restaurantes.proteins')}</li>
                <li> {t('restaurantes.meats')}</li>
                <li> {t('restaurantes.vegetables')}</li>
                <li> {t('restaurantes.salads')}</li>
                <li> {t('restaurantes.specialDiets')}</li>
                <li> {t('restaurantes.desserts')}</li>
              </ul>
              <div className="room-details">
                <div className="detail-item">
                  <span>{t('restaurantes.buffetNote')}</span>
                </div>
                </div>
            </div>
          </div>

          {/* Card 3 - Restaurante Italiano */}
          <div className="room-card">
            <div className="room-image-small">
              <img src={images[2]} alt="Comodidades Veranda King" />
            </div>
            <div className="room-info">
              <h3>{t('restaurantes.italian')}</h3>
              <p>{t('restaurantes.italianDesc')}</p>
              <ul className="room-features">
                <li> {t('restaurantes.woodOvenPizza')}</li>
                <li> {t('restaurantes.homemadePasta')}</li>
                <li> {t('restaurantes.risotto')}</li>
                <li> {t('restaurantes.italianWine')}</li>
              </ul>
            </div>
          </div>

            {/* Card 4 - Comodidades */}
          <div className="room-card">
            <div className="room-image-small">
              <img src={images[3]} alt="Comodidades Veranda King" />
            </div>
            <div className="room-info">
              <h3>{t('restaurantes.grill')}</h3>
              <p>{t('restaurantes.grillDesc')}</p>
              <ul className="room-features">
                <li> {t('restaurantes.grillMeat')}</li>
                <li> {t('restaurantes.chickenPork')}</li>
                <li> {t('restaurantes.freshSides')}</li>
                <li> {t('restaurantes.regionalDesserts')}</li>
              </ul>
            </div>
          </div>

        </div>
      </div>

    </div>
    </PageTransition>
  )
}

export default Restaurantes