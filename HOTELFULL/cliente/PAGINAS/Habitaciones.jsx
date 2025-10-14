import '../ESTILOS/Habitaciones.css'
import React from 'react'
import { useTranslation } from 'react-i18next'
import RoomCard from '../COMPONENTES/RoomCard';
import PageTransition from '../COMPONENTES/PageTransition.jsx'

function Habitaciones() {
  const { t } = useTranslation();

  return (
    <PageTransition>
    <div className="habitaciones-page">
      <div className="hab-header">
        <h1>{t('habitaciones.title')}</h1>
        <p>{t('habitaciones.subtitle')}</p>
      </div>

      <div className="container">
        <div className="rooms-grid">
          {/* habitación1 */}
          <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/1dormitorio/d1a.jpeg',
              '/recursos/IMAGENES/habitaciones/1dormitorio/d1b.jpeg',
              '/recursos/IMAGENES/habitaciones/1dormitorio/d1c.jpeg',
            ]}
            title={t('habitaciones.verandaKing')}
            description={t('habitaciones.desc1')}
            badge={t('habitaciones.oceanView')}
            features={[
              { icon: 'fa-water', text: t('habitaciones.view') },
              { icon: 'fa-bed', text: t('habitaciones.kingBed') },
              { icon: 'fa-tv', text: t('habitaciones.smartTv') },
              { icon: 'fa-wind', text: t('habitaciones.airConditioning') },
              { icon: 'fa-bath', text: t('habitaciones.bath') },
              { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi') },
            ]}
            details={{ guests: `2/3 ${t('habitaciones.guests')}`, size: '60 m²' }}
            price="$250"
            period={t('habitaciones.perNight')}
          />
          {/* habitación2 */}
          <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/2dormitorio/d2a.jpeg',
              '/recursos/IMAGENES/habitaciones/2dormitorio/d2b.jpeg',
              '/recursos/IMAGENES/habitaciones/2dormitorio/d2c.jpeg',
              '/recursos/IMAGENES/habitaciones/2dormitorio/d2d.jpeg',
              '/recursos/IMAGENES/habitaciones/2dormitorio/d2e.jpeg',
              
            ]}
            title="Family Suite"
            description={t('habitaciones.desc2')}
            badge="Apartment"
            features={[
              { icon: 'fa-users', text: t('habitaciones.2rooms') },
              { icon: 'fa-blender', text: t('habitaciones.kitchen') },
              { icon: 'fa-tv', text: t('habitaciones.tvs') },
              { icon: 'fa-wind', text: t('habitaciones.airConditioning') },
              { icon: 'fa-bath', text: t('habitaciones.luxuryBath') },
              { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi') },
            ]}
            details={{ guests: `2  ${t('habitaciones.adultos')} y 2 ${t('habitaciones.niños')}`, size: '100 m²' }}
            price="$410"
            period={t('habitaciones.perNight')}
          />

          {/*habitación3  Suite Romántica */}
          <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/3dormitorio/d3a.jpeg',
              '/recursos/IMAGENES/habitaciones/3dormitorio/d3b.jpeg',
            ]}
            title="Moon Suite"
            description={t('habitaciones.desc3')}
            badge="Honeymoon"
            features={[
              { icon: 'fa-heart', text: t('habitaciones.romanticSetup') },
              { icon: 'fa-bath', text: t('habitaciones.jacuzziPetals') },
              { icon: 'fa-concierge-bell', text: t('habitaciones.roomService') },
              { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
            ]}
            details={{ guests: `2 ${t('habitaciones.guests')}`, size: '45 m²' }}
            price="$190"
            period={t('habitaciones.perNight')}
          />
          
          {/*habitación4  Suite Jardín Moderno */}
          <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/4dormitorio/d4a.jpeg',
              '/recursos/IMAGENES/habitaciones/4dormitorio/d4b.jpeg',
              '/recursos/IMAGENES/habitaciones/4dormitorio/d4c.jpeg',
            ]}
            title="Green Suite"
            description={t('habitaciones.desc4')}
            badge="Pool"
            features={[
              { icon: 'fa-seedling', text: t('habitaciones.jardin') },
              { icon: 'fa-swimmer', text: t('habitaciones.pool') },
              { icon: 'fa-gem', text: t('habitaciones.marmol') },
              { icon: 'fa-bath', text: t('habitaciones.bath') },
              { icon: 'fa-coffee', text: t('habitaciones.cafe') },
              { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
            ]}
            details={{ guests: `2 ${t('habitaciones.guests')}`, size: '70 m²' }}
            price="$250"
            period={t('habitaciones.perNight')}
          />
          
          {/*habitación5 */}
            <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/5presidencial/p1.jpeg',
              '/recursos/IMAGENES/habitaciones/5presidencial/p2.jpeg',
              
            ]}
            title="Suite Presidencial"
            description={t('habitaciones.desc5')}
            badge="VIP"
            features={[
              { icon: 'fa-crown', text: t('habitaciones.service') },
              { icon: 'fa-bath', text: t('habitaciones.jacuzzi') },
              { icon: 'fa-glass-cheers', text: t('habitaciones.bar') },
              { icon: 'fa-sun', text: t('habitaciones.balcony') },
              { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
            ]}
            details={{ guests: `2 ${t('habitaciones.guests')}`, size: '60 m²' }}
            price="$250"
            period={t('habitaciones.perNight')}
          />

          {/* 6️6 Habitación Ejecutiva */}
          <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/6dormitorio/d6a.jpeg',
              '/recursos/IMAGENES/habitaciones/6dormitorio/d6b.jpeg',
              '/recursos/IMAGENES/habitaciones/6dormitorio/d6c.jpeg',
            ]}
            title="Executive Suite"
            description={t('habitaciones.desc6')}
            badge="Business"
            features={[
              { icon: 'fa-briefcase', text: t('habitaciones.desk') },
              { icon: 'fa-coffee', text: t('habitaciones.cafe') },
              { icon: 'fa-tv', text: t('habitaciones.smartTv') },
              { icon: 'fa-bath', text: t('habitaciones.bath') },
              { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
            ]}
            details={{ guests: `1/2 ${t('habitaciones.guests')}`, size: '40 m²' }}
            price="$90"
            period={t('habitaciones.perNight')}
          />

          
        </div>
      </div>

    </div>
    </PageTransition>
  )
}

export default Habitaciones