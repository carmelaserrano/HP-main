import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../backend/supabaseClient';
import '../ESTILOS/Registro.css';
import PageTransition from '../COMPONENTES/PageTransition.jsx'

function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validacion basica
      if (!nombre || !apellido || !email || !password || !confirmPassword) {
        setError('Por favor, completa todos los campos');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Registrar usuario en Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) {
        setError('Error al crear la cuenta: ' + signUpError.message);
        setLoading(false);
        return;
      }

      // Guardar información adicional del usuario
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          nombre: nombre,
          apellido: apellido,
          email: email,
          rol: 'huesped',
        },
      ]);

      if (insertError) {
        setError('Error al guardar la información del usuario');
        setLoading(false);
        return;
      }

      // Verificar si hay una reserva pendiente
      const pendingReservation = localStorage.getItem('pendingReservation');

      alert('Registro exitoso! Bienvenido.');

      // Si hay reserva pendiente, ir al dashboard con los datos de reserva
      if (pendingReservation) {
        const roomData = JSON.parse(pendingReservation);
        navigate('/huesped/dashboard', { state: { reservationData: roomData } });
      } else {
        navigate('/huesped/dashboard');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      console.error('Error de registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="registro-page">
      <div className="registro-container">
        <button
          onClick={() => navigate('/')}
          className="btn-back"
          type="button"
        >
          ← Volver al inicio
        </button>

        <div className="registro-header">
          <h1>Crear Cuenta</h1>
          <p>Registrate para hacer reservas</p>
        </div>

        <form className="registro-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span></span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido</label>
            <input
              type="text"
              id="apellido"
              placeholder="Tu apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electronico</label>
            <input
              type="email"
              id="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Minimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="registro-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className="login-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </form>
      </div>
    </div>
    </PageTransition>
  );
}

export default Registro;
