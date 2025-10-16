import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient.jsx';

function RoomCard({ images, title, description, badge, features, details, price, period }) {
  const [currentImage, setCurrentImage] = React.useState(0);
  const navigate = useNavigate();

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleReservar = async () => {
    // Verificar si el usuario está autenticado
    const { data: { session } } = await supabase.auth.getSession();

    // Preparar datos de la habitación para la reserva
    const roomData = {
      title,
      price: price.replace('$', ''),
      badge,
      details,
      image: images[0]
    };

    // Guardar en localStorage para usar después del login/registro
    localStorage.setItem('pendingReservation', JSON.stringify(roomData));

    if (!session) {
      // Si no está autenticado, redirigir al login
      navigate('/login', { state: { from: 'reservation', roomData } });
    } else {
      // Si está autenticado, ir al dashboard de huésped con los datos
      navigate('/huesped/dashboard', { state: { reservationData: roomData } });
    }
  };

  return (
    <div className="room-card featured">
      <div className="room-image-gallery">
        <img src={images[currentImage]} alt={title} className="room-main-image" />

        <div className="gallery-controls">
          <button onClick={prevImage} className="gallery-btn prev">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button onClick={nextImage} className="gallery-btn next">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="image-indicators">
          {images.map((_, index) => (
            <span
              key={index}
              className={`indicator ${index === currentImage ? 'active' : ''}`}
              onClick={() => setCurrentImage(index)}
            ></span>
          ))}
        </div>

        {badge && <span className="room-badge">{badge}</span>}
      </div>

      <div className="room-info">
        <h3>{title}</h3>
        <p className="room-description">{description}</p>

        <ul className="room-features">
          {features.map((item, i) => (
            <li key={i}>
              <i className={`fas ${item.icon}`}></i> {item.text}
            </li>
          ))}
        </ul>

        <div className="room-details">
          <div className="detail-item">
            <i className="fas fa-users"></i>
            <span>{details.guests}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-ruler-combined"></i>
            <span>{details.size}</span>
          </div>
        </div>

        <div className="room-price">
          <span className="price">{price}</span>
          <span className="period">{period}</span>
        </div>

        <button className="btn-room" onClick={handleReservar}>
          <i className="fas fa-calendar-check"></i> Reservar ahora
        </button>
      </div>
    </div>
  );
}

export default RoomCard;
