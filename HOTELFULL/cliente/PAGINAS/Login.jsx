import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../backend/supabaseClient';
import '../ESTILOS/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validación básica
      if (!email || !password) {
        setError('Por favor, completa todos los campos');
        setLoading(false);
        return;
      }

      // Autenticación con Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        setError('Contraseña o usuario incorrecto. Por favor, intenta de nuevo.');
        setLoading(false);
        return;
      }

      // Obtener el rol del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        setError('Error al obtener información del usuario');
        setLoading(false);
        return;
      }

      // Redirigir según el rol
      const rol = userData.rol;
      if (rol === 'admin') {
        navigate('/admin/dashboard');
      } else if (rol === 'operador') {
        navigate('/operador/dashboard');
      } else if (rol === 'huesped') {
        navigate('/huesped/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      console.error('Error de login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Bienvenido</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
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
              <span>Recordarme</span>
            </label>
            <a href="/recuperar-password" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <div className="register-link">
            ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;