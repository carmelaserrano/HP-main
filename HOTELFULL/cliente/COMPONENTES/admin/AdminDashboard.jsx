import React, { useState, useEffect } from 'react';
import { supabase } from '../../../backend/supabaseClient.jsx'
import { useNavigate } from 'react-router-dom';
import '../../ESTILOS/Dashboard.css';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalHabitaciones: 0,
    habitacionesDisponibles: 0,
    reservasActivas: 0,
    totalUsuarios: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUser(profileData);

      // Estadísticas
      const { count: totalHab } = await supabase
        .from('habitaciones')
        .select('*', { count: 'exact', head: true });

      const { count: habDisponibles } = await supabase
        .from('habitaciones')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'disponible');

      const { count: reservasActivas } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
        .in('estado', ['pendiente', 'confirmada']);

      const { count: totalUsuarios } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalHabitaciones: totalHab || 0,
        habitacionesDisponibles: habDisponibles || 0,
        reservasActivas: reservasActivas || 0,
        totalUsuarios: totalUsuarios || 0
      });

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>👑 Panel de Administrador - {user?.nombre}</h1>
        <button onClick={handleLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-hotel"></i>
            <h3>{stats.totalHabitaciones}</h3>
            <p>Total Habitaciones</p>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-door-open"></i>
            <h3>{stats.habitacionesDisponibles}</h3>
            <p>Disponibles</p>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-calendar-check"></i>
            <h3>{stats.reservasActivas}</h3>
            <p>Reservas Activas</p>
          </div>
          
          <div className="stat-card">
            <i className="fas fa-users"></i>
            <h3>{stats.totalUsuarios}</h3>
            <p>Usuarios</p>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>⚡ Gestión Rápida</h2>
          <div className="admin-actions">
            <button className="admin-btn">
              <i className="fas fa-bed"></i>
              Gestionar Habitaciones
            </button>
            <button className="admin-btn">
              <i className="fas fa-calendar-alt"></i>
              Ver Todas las Reservas
            </button>
            <button className="admin-btn">
              <i className="fas fa-users-cog"></i>
              Gestionar Usuarios
            </button>
            <button className="admin-btn">
              <i className="fas fa-chart-line"></i>
              Reportes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;