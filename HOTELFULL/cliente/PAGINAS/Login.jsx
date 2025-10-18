import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient';
import '../ESTILOS/Login.css';
import PageTransition from '../COMPONENTES/PageTransition.jsx'
import { useTranslation } from 'react-i18next'

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validación básica
      if (!email || !password) {
        setError(t('login.campos'));
        setLoading(false);
        return;
      }

      // Autenticación con Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        setError(t('login.incorrecto'));
        setLoading(false);
        return;
      }

      // Obtener el rol del usuario
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        setError(t('login.info'));
        setLoading(false);
        return;
      }

      // Verificar si hay una reserva pendiente
      const pendingReservation = localStorage.getItem('pendingReservation');

      // Redirigir según el rol
      const rol = userData.rol;
      if (rol === 'admin') {
        navigate('/admin/dashboard');
      } else if (rol === 'operador') {
        navigate('/operador/dashboard');
      } else if (rol === 'huesped') {
        // Si hay reserva pendiente, ir al dashboard con los datos de reserva
        if (pendingReservation) {
          const roomData = JSON.parse(pendingReservation);
          navigate('/huesped/dashboard', { state: { reservationData: roomData } });
        } else {
          navigate('/huesped/dashboard');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(t('login.error'));
      console.error('Error de login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="login-page">
      <div className="login-container">
        <button
          onClick={() => navigate('/')}
          className="btn-back"
          type="button"
        >
          ← {t('login.button')}
        </button>

        <div className="login-header">
          <h1>{t('login.title')}</h1>
          <p>{t('login.sesion')}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">{t('login.mail')}</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                placeholder={t('login.placeholder1')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('login.contraseña')}</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder={t('login.placeholder2',)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>{t('login.recordarme')}</span>
            </label>
            <Link to="/recuperar-password" className="forgot-password">
              {t('login.olvidar')}
            </Link>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                {t('login.iniciar')}
              </>
            ) : (
              t('login.iniciarSesion')
            )}
          </button>

          <div className="register-link">
            {t('login.registro')} <a href="/registro">{t('login.registar')}</a>
          </div>
        </form>
      </div>
    </div>
    </PageTransition>
  );
}

export default Login;