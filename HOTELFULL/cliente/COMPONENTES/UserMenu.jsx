import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient';
import '../ESTILOS/UserMenu.css';

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si está en el dashboard
  const isInDashboard = location.pathname.includes('/dashboard');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Usuario en UserMenu:', user);

        if (user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('nombre, apellido, rol')
            .eq('id', user.id)
            .single();

          console.log('📋 Datos del perfil:', profileData, 'Error:', error);

          if (!error && profileData) {
            setUserData({
              ...user,
              nombre: profileData.nombre,
              apellido: profileData.apellido,
              rol: profileData.rol
            });
          } else {
            setUserData({
              ...user,
              nombre: 'Usuario',
              apellido: '',
              rol: 'huesped'
            });
          }
        }
      } catch (error) {
        console.error('❌ Error al cargar datos del usuario:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/');
    window.location.reload();
  };

  const handleNavigation = () => {
    setIsOpen(false);
    if (isInDashboard) {
      // Si está en el dashboard, volver al inicio
      navigate('/');
    } else {
      // Si está fuera, ir al dashboard
      navigate('/huesped/dashboard');
    }
  };

  if (!userData) {
    return (
      <button className="btn-booking-top" disabled>
        Cargando...
      </button>
    );
  }

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button
        className="user-menu-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          <i className="fas fa-user"></i>
        </div>
        <span className="user-name">
          {userData.nombre} {userData.apellido}
        </span>
        <i className={`fas fa-chevron-down arrow ${isOpen ? 'open' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          {/* Información del usuario */}
          <div className="dropdown-header">
            <div className="user-avatar-large">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-details">
              <p className="user-full-name">{userData.nombre} {userData.apellido}</p>
              <p className="user-email">{userData.email}</p>
            </div>
          </div>

          {/* Botones de acción */}
          {/* Solo huéspedes pueden navegar entre dashboard e inicio */}
          {userData.rol === 'huesped' && (
            <button className="dropdown-item" onClick={handleNavigation}>
              {isInDashboard ? (
                <>
                  <i className="fas fa-home"></i>
                  <span>Volver al Inicio</span>
                </>
              ) : (
                <>
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Ir a Dashboard</span>
                </>
              )}
            </button>
          )}

          {/* Todos pueden cerrar sesión */}
          <button className="dropdown-item logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
