import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Map.css';

function Map() {
  // Coordenadas del hotel
  const hotelUbicacion = { lat: 24.7070, lng: -81.1201 };

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '12px'
  };

  const mapOptions = {
    zoom: 15,
    center: hotelUbicacion,
    disableDefaultUI: false,
  };

  return (
    <div className="map-container">
      <LoadScript googleMapsApiKey="AIzaSyCi4kNgfdXUOFezo1mcRUwbkKDjz33nKIY">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          {...mapOptions}
        >
          <Marker position={hotelUbicacion} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default Map;
