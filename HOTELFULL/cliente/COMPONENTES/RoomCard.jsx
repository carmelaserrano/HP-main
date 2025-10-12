import React from 'react';

function RoomCard({ images, title, description, badge, features, details, price, period }) {
  const [currentImage, setCurrentImage] = React.useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
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

        <button className="btn-room">
          <i className="fas fa-calendar-check"></i> Reservar ahora
        </button>
      </div>
    </div>
  );
}

export default RoomCard;
