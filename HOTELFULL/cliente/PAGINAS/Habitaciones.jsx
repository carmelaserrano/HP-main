import '../ESTILOS/Habitaciones.css'
import React from 'react'
import { useTranslation } from 'react-i18next'
import RoomCard from '../COMPONENTES/RoomCard';

function Habitaciones() {
  const { t } = useTranslation();

  return (
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
            description={t('habitaciones.verandaDesc')}
            badge={t('habitaciones.oceanView')}
            features={[
              { icon: 'fa-water', text: t('habitaciones.panoramicView') },
              { icon: 'fa-bed', text: t('habitaciones.kingBed') },
              { icon: 'fa-door-open', text: t('habitaciones.privateVeranda') },
              { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi') },
              { icon: 'fa-tv', text: t('habitaciones.smartTv') },
              { icon: 'fa-wind', text: t('habitaciones.airConditioning') },
              { icon: 'fa-bath', text: t('habitaciones.luxuryBath') },
              { icon: 'fa-concierge-bell', text: t('habitaciones.roomService') },
            ]}
            details={{ guests: `2 ${t('habitaciones.guests')}`, size: '42 m²' }}
            price="$280"
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
            description="La opción Family cuenta con una recámara con cama king-size con TV y una recámara doble, una cocina gourmet bien equipada, un espacio adjunto con comedor formal, una sala de estar cómoda y una TV, dos baños, y una terraza privada."
            badge="Jacuzzi"
            features={[
              { icon: 'fa-users', text: '2 habitaciones' },
              { icon: 'fa-kitchen-set', text: 'Kitchenette equipada' },
              { icon: 'fa-tv', text: 'Smart TV' },
              { icon: 'fa-bed', text: t('habitaciones.kingBed') },
              { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi') },
              { icon: 'fa-wind', text: t('habitaciones.airConditioning') },
              { icon: 'fa-bath', text: t('habitaciones.luxuryBath') },
            ]}
            details={{ guests: '2 adultos y 2 niños', size: '42 m²' }}
            price="$310"
            period={t('habitaciones.perNight')}
          />

          {/*habitación3  Suite Romántica */}
          <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/3dormitorio/d3a.jpeg',
              '/recursos/IMAGENES/habitaciones/3dormitorio/d3b.jpeg',
            ]}
            title="Suite Romántica"
            description="Perfecta para parejas, con jacuzzi, iluminación tenue y servicio de bienvenida."
            badge="Honeymoon"
            features={[
              { icon: 'fa-heart', text: 'Decoración romántica' },
              { icon: 'fa-bath', text: 'Jacuzzi con pétalos' },
              { icon: 'fa-wifi', text: 'Wi-Fi gratuito' },
            ]}
            details={{ guests: '2 adultos', size: '55 m²' }}
            price="$450"
            period={t('habitaciones.perNight')}
          />
          
          {/*habitación4  Suite Jardín Moderno */}
          <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/4dormitorio/d4a.jpeg',
              '/recursos/IMAGENES/habitaciones/4dormitorio/d4b.jpeg',
              '/recursos/IMAGENES/habitaciones/4dormitorio/d4c.jpeg',
            ]}
            title="Suite Jardín Moderno"
            description="Una suite contemporánea rodeada de vegetación, con detalles en mármol negro, jardín privado y una piscina rodeada de plantas que ofrece un ambiente natural y elegante."
            badge="Premium"
            features={[
              { icon: 'fa-seedling', text: 'Jardín privado con vegetación natural' },
              { icon: 'fa-swimmer', text: 'Pileta privada con deck de madera' },
              { icon: 'fa-gem', text: 'Decoración en mármol negro' },
              { icon: 'fa-wifi', text: 'Wi-Fi de alta velocidad' },
              { icon: 'fa-coffee', text: 'Cafetera y amenities de lujo' },
            ]}
            details={{ guests: '2 personas', size: '85 m²' }}
            price="$720"
            period={t('habitaciones.perNight')}
          />
          
          {/*habitación5 */}
            <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/5presidencial/p1.jpeg',
              '/recursos/IMAGENES/habitaciones/5presidencial/p2.jpeg',
              
            ]}
            title="Suite Presidencial"
            description="La habitación más exclusiva con jacuzzi, vista panorámica y servicio de mayordomo."
            badge="VIP"
            features={[
              { icon: 'fa-crown', text: 'Mayordomo personal' },
              { icon: 'fa-bath', text: 'Jacuzzi privado' },
              { icon: 'fa-wifi', text: 'Wi-Fi premium' },
              { icon: 'fa-glass-cheers', text: 'Minibar exclusivo' },
            ]}
            details={{ guests: '4 personas', size: '100 m²' }}
            price="$850"
            period={t('habitaciones.perNight')}
          />

          {/* 6️6 Habitación Ejecutiva */}
          <RoomCard
            images={[
              '/recursos/IMAGENES/habitaciones/6dormitorio/d6a.jpeg',
              '/recursos/IMAGENES/habitaciones/6dormitorio/d6b.jpeg',
              '/recursos/IMAGENES/habitaciones/6dormitorio/d6c.jpeg',
            ]}
            title="Habitación Ejecutiva"
            description="Diseñada para viajeros de negocios, con escritorio, cafetera premium y acceso al lounge."
            badge="Business"
            features={[
              { icon: 'fa-briefcase', text: 'Espacio de trabajo' },
              { icon: 'fa-coffee', text: 'Cafetera Nespresso' },
              { icon: 'fa-wifi', text: 'Wi-Fi de alta velocidad' },
            ]}
            details={{ guests: '1 o 2 adultos', size: '35 m²' }}
            price="$320"
            period={t('habitaciones.perNight')}
          />

          
        </div>
      </div>

    </div>
  )
}

export default Habitaciones