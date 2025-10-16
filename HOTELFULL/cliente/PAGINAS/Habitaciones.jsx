import '../ESTILOS/Habitaciones.css'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import RoomCard from '../COMPONENTES/RoomCard';
import PageTransition from '../COMPONENTES/PageTransition.jsx'
import { supabase } from '../SERVICIOS/supabaseClient';

function Habitaciones() {
  const { t } = useTranslation();
  const [habitaciones, setHabitaciones] = useState([]);

  // Mapeo de tipos de habitación a imágenes y badges
  const roomImageMap = {
    'Veranda King Suite': {
      images: [
        '/recursos/IMAGENES/habitaciones/1dormitorio/d1a.jpeg',
        '/recursos/IMAGENES/habitaciones/1dormitorio/d1b.jpeg',
        '/recursos/IMAGENES/habitaciones/1dormitorio/d1c.jpeg',
      ],
      badge: t('habitaciones.oceanView'),
      features: [
        { icon: 'fa-water', text: t('habitaciones.view') },
        { icon: 'fa-bed', text: t('habitaciones.kingBed') },
        { icon: 'fa-tv', text: t('habitaciones.smartTv') },
        { icon: 'fa-wind', text: t('habitaciones.airConditioning') },
        { icon: 'fa-bath', text: t('habitaciones.bath') },
        { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi') },
      ]
    },
    'Family Suite': {
      images: [
        '/recursos/IMAGENES/habitaciones/2dormitorio/d2a.jpeg',
        '/recursos/IMAGENES/habitaciones/2dormitorio/d2b.jpeg',
        '/recursos/IMAGENES/habitaciones/2dormitorio/d2c.jpeg',
        '/recursos/IMAGENES/habitaciones/2dormitorio/d2d.jpeg',
        '/recursos/IMAGENES/habitaciones/2dormitorio/d2e.jpeg',
      ],
      badge: 'Apartment',
      features: [
        { icon: 'fa-users', text: t('habitaciones.2rooms') },
        { icon: 'fa-blender', text: t('habitaciones.kitchen') },
        { icon: 'fa-tv', text: t('habitaciones.tvs') },
        { icon: 'fa-wind', text: t('habitaciones.airConditioning') },
        { icon: 'fa-bath', text: t('habitaciones.luxuryBath') },
        { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi') },
      ]
    },
    'Moon Suite': {
      images: [
        '/recursos/IMAGENES/habitaciones/3dormitorio/d3a.jpeg',
        '/recursos/IMAGENES/habitaciones/3dormitorio/d3b.jpeg',
      ],
      badge: 'Honeymoon',
      features: [
        { icon: 'fa-heart', text: t('habitaciones.romanticSetup') },
        { icon: 'fa-bath', text: t('habitaciones.jacuzziPetals') },
        { icon: 'fa-concierge-bell', text: t('habitaciones.roomService') },
        { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
      ]
    },
    'Green Suite': {
      images: [
        '/recursos/IMAGENES/habitaciones/4dormitorio/d4a.jpeg',
        '/recursos/IMAGENES/habitaciones/4dormitorio/d4b.jpeg',
        '/recursos/IMAGENES/habitaciones/4dormitorio/d4c.jpeg',
      ],
      badge: 'Pool',
      features: [
        { icon: 'fa-seedling', text: t('habitaciones.jardin') },
        { icon: 'fa-swimmer', text: t('habitaciones.pool') },
        { icon: 'fa-gem', text: t('habitaciones.marmol') },
        { icon: 'fa-bath', text: t('habitaciones.bath') },
        { icon: 'fa-coffee', text: t('habitaciones.cafe') },
        { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
      ]
    },
    'Suite Presidencial': {
      images: [
        '/recursos/IMAGENES/habitaciones/5presidencial/p1.jpeg',
        '/recursos/IMAGENES/habitaciones/5presidencial/p2.jpeg',
      ],
      badge: 'VIP',
      features: [
        { icon: 'fa-crown', text: t('habitaciones.service') },
        { icon: 'fa-bath', text: t('habitaciones.jacuzzi') },
        { icon: 'fa-glass-cheers', text: t('habitaciones.bar') },
        { icon: 'fa-sun', text: t('habitaciones.balcony') },
        { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
      ]
    },
    'Executive Suite': {
      images: [
        '/recursos/IMAGENES/habitaciones/6dormitorio/d6a.jpeg',
        '/recursos/IMAGENES/habitaciones/6dormitorio/d6b.jpeg',
        '/recursos/IMAGENES/habitaciones/6dormitorio/d6c.jpeg',
      ],
      badge: 'Business',
      features: [
        { icon: 'fa-briefcase', text: t('habitaciones.desk') },
        { icon: 'fa-coffee', text: t('habitaciones.cafe') },
        { icon: 'fa-tv', text: t('habitaciones.smartTv') },
        { icon: 'fa-bath', text: t('habitaciones.bath') },
        { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
      ]
    },
    'Simple': {
      images: [
        '/recursos/IMAGENES/habitaciones/6dormitorio/d6a.jpeg',
        '/recursos/IMAGENES/habitaciones/6dormitorio/d6b.jpeg',
      ],
      badge: 'Standard',
      features: [
        { icon: 'fa-bed', text: t('habitaciones.kingBed') },
        { icon: 'fa-tv', text: t('habitaciones.smartTv') },
        { icon: 'fa-wind', text: t('habitaciones.airConditioning') },
        { icon: 'fa-bath', text: t('habitaciones.bath') },
        { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
      ]
    },
    'Doble': {
      images: [
        '/recursos/IMAGENES/habitaciones/1dormitorio/d1a.jpeg',
        '/recursos/IMAGENES/habitaciones/1dormitorio/d1b.jpeg',
      ],
      badge: 'Standard',
      features: [
        { icon: 'fa-bed', text: t('habitaciones.kingBed') },
        { icon: 'fa-tv', text: t('habitaciones.smartTv') },
        { icon: 'fa-wind', text: t('habitaciones.airConditioning') },
        { icon: 'fa-bath', text: t('habitaciones.bath') },
        { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
      ]
    },
    'Suite': {
      images: [
        '/recursos/IMAGENES/habitaciones/3dormitorio/d3a.jpeg',
        '/recursos/IMAGENES/habitaciones/3dormitorio/d3b.jpeg',
      ],
      badge: 'Luxury',
      features: [
        { icon: 'fa-bed', text: t('habitaciones.kingBed') },
        { icon: 'fa-tv', text: t('habitaciones.smartTv') },
        { icon: 'fa-wind', text: t('habitaciones.airConditioning') },
        { icon: 'fa-bath', text: t('habitaciones.bath') },
        { icon: 'fa-wifi', text: t('habitaciones.highSpeedWifi')},
      ]
    }
  };

  useEffect(() => {
    cargarHabitaciones();
  }, []);

  const cargarHabitaciones = async () => {
    const { data, error } = await supabase
      .from('habitaciones')
      .select('*')
      .eq('estado', 'disponible');

    if (error) {
      console.error('Error al cargar habitaciones:', error);
    } else {
      setHabitaciones(data || []);
    }
  };

  return (
    <PageTransition>
    <div className="habitaciones-page">
      <div className="hab-header">
        <h1>{t('habitaciones.title')}</h1>
        <p>{t('habitaciones.subtitle')}</p>
      </div>

      <div className="container">
        <div className="rooms-grid">
          {habitaciones.map((habitacion) => {
            // Si la habitación tiene imágenes propias, usarlas; si no, usar del mapeo
            const roomConfig = roomImageMap[habitacion.tipo] || roomImageMap['Simple'];
            const imagesToShow = habitacion.imagenes && habitacion.imagenes.length > 0
              ? habitacion.imagenes
              : roomConfig.images;

            return (
              <RoomCard
                key={habitacion.id}
                images={imagesToShow}
                title={habitacion.tipo}
                description={habitacion.descripcion}
                badge={roomConfig.badge}
                features={roomConfig.features}
                details={{
                  guests: `${habitacion.capacidad} ${t('habitaciones.guests')}`,
                  size: '60 m²'
                }}
                price={`$${habitacion.precio_por_noche}`}
                period={t('habitaciones.perNight')}
              />
            );
          })}
        </div>
      </div>

    </div>
    </PageTransition>
  )
}

export default Habitaciones