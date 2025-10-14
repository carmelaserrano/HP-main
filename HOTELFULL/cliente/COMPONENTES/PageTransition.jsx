import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../ESTILOS/transicion.css';

function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fade-in');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fade-out');
    }
  }, [location, displayLocation]);

  const onAnimationEnd = () => {
    if (transitionStage === 'fade-out') {
      setTransitionStage('fade-in');
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={`page-container ${transitionStage}`}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
}

export default PageTransition;
