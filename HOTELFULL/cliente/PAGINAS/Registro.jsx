import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient';
import '../ESTILOS/Registro.css';
import PageTransition from '../COMPONENTES/PageTransition.jsx'
import { useTranslation } from 'react-i18next'
function Registro() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validacion basica
      if (!nombre || !apellido || !email || !password || !confirmPassword) {
        setError(t('registro.campos'));
        setLoading(false);
        return;
      }

      // Validar que nombre solo contenga letras y espacios
      const nombreRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
      if (!nombreRegex.test(nombre)) {
        setError(t('registro.nombre'));
        setLoading(false);
        return;
      }

      // Validar que apellido solo contenga letras y espacios
      if (!nombreRegex.test(apellido)) {
        setError(t('registro.apellido'));
        setLoading(false);
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError(t('registro.correo'));
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError(t('registro.contra'));
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError(t('registro.error'));
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

        setError(t('registro.error2') + signUpError.message);

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

        setError(t('registro.error3'));

        setLoading(false);
        return;
      }

      // Verificar si hay una reserva pendiente
      const pendingReservation = localStorage.getItem('pendingReservation');

      alert(t('registro.reg'));

      // Si hay reserva pendiente, ir al dashboard con los datos de reserva
      if (pendingReservation) {
        const roomData = JSON.parse(pendingReservation);
        navigate('/huesped/dashboard', { state: { reservationData: roomData } });
      } else {
        navigate('/huesped/dashboard');
      }
    } catch (err) {
      setError(t('registro.error4'));
      console.error((t('registro.error5')), err);
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
          ← {t('registro.title')}
        </button>

        <div className="registro-header">
          <h1>{t('registro.h1')}</h1>
          <p>{t('registro.registro')}</p>
        </div>

        <form className="registro-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span></span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nombre">{t('registro.name')}</label>
            <input
              type="text"
              id="nombre"
              placeholder={t('registro.place1')}
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
            <label htmlFor="apellido">{t('registro.lastname')}</label>
            <input
              type="text"
              id="apellido"
              placeholder={t('registro.place2')}
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
            <label htmlFor="email">{t('registro.email')}</label>
            <input
              type="email"
              id="email"
              placeholder={t('registro.place3')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('registro.password')}</label>
            <input
              type="password"
              id="password"
              placeholder={t('registro.place4')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('registro.confirm')}</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder={t('registro.place5')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="registro-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className="login-link">
            {t('registro.login')}<Link to="/login">{t('registro.sesion')}</Link>
          </div>
        </form>
      </div>
    </div>
    </PageTransition>
  );
}

export default Registro;
