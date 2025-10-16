import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient';

function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error al obtener rol:', error);
        setLoading(false);
        return;
      }

      setUserRole(profileData.rol);
      setLoading(false);
    } catch (err) {
      console.error('Error en autenticación:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verificando acceso...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="access-denied">
        <h2>⛔ Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
        <p>Tu rol: <strong>{userRole}</strong></p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;