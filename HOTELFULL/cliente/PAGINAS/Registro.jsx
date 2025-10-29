import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient';
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

      // Validar que nombre solo contenga letras y espacios
      const nombreRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
      if (!nombreRegex.test(nombre)) {
        setError('El nombre solo puede contener letras y espacios');
        setLoading(false);
        return;
      }

      // Validar que apellido solo contenga letras y espacios
      if (!nombreRegex.test(apellido)) {
        setError('El apellido solo puede contener letras y espacios');
        setLoading(false);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Por favor, ingresa un correo electrónico válido');
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
        console.error('Error de Supabase auth:', signUpError);

        // Traducir errores comunes de autenticación al español
        let mensajeError = 'Error al crear la cuenta';

        if (signUpError.message.includes('User already registered') ||
            signUpError.message.includes('already registered')) {
          mensajeError = 'Este correo electrónico ya está registrado. Por favor, inicia sesión.';
        } else if (signUpError.message.includes('Password should be at least')) {
          mensajeError = 'La contraseña debe tener al menos 6 caracteres';
        } else if (signUpError.message.includes('Invalid email')) {
          mensajeError = 'El correo electrónico no es válido';
        } else if (signUpError.message.includes('Email rate limit exceeded')) {
          mensajeError = 'Demasiados intentos. Por favor, espera unos minutos e intenta de nuevo.';
        } else if (signUpError.message.includes('weak password')) {
          mensajeError = 'La contraseña es demasiado débil';
        } else {
          mensajeError = `Error al crear la cuenta: ${signUpError.message}`;
        }

        setError(mensajeError);
        setLoading(false);
        return;
      }

      // Guardar información adicional del usuario
      // Usar upsert para actualizar si ya existe (por si hay un trigger automático)
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            nombre: nombre,
            apellido: apellido,
            email: email,
            rol: 'huesped',
            activo: true
          },
          { onConflict: 'id' }
        );

      if (insertError) {
        console.error('Error detallado de Supabase:', insertError);

        // Traducir errores comunes al español
        let mensajeError = 'Error al guardar la información del usuario';

        if (insertError.message.includes('duplicate key')) {
          mensajeError = 'Este usuario ya existe en el sistema';
        } else if (insertError.message.includes('violates foreign key')) {
          mensajeError = 'Error de referencia en la base de datos';
        } else if (insertError.message.includes('null value')) {
          mensajeError = 'Falta información requerida en el perfil';
        } else if (insertError.code === '23505') {
          mensajeError = 'Este email ya está registrado';
        } else {
          mensajeError = `Error: ${insertError.message}`;
        }

        setError(mensajeError);
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
              onChange={(e) => {
                const value = e.target.value;
                // Solo permitir letras y espacios
                if (value === '' || /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) {
                  setNombre(value);
                }
              }}
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
              onChange={(e) => {
                const value = e.target.value;
                // Solo permitir letras y espacios
                if (value === '' || /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value)) {
                  setApellido(value);
                }
              }}
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
