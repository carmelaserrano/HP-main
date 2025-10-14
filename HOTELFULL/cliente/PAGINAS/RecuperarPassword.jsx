import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../backend/supabaseClient';
import '../ESTILOS/RecuperarPassword.css';

function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Validación básica
      if (!email) {
        setError('Por favor, ingresa tu correo electrónico');
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Por favor, ingresa un correo electrónico válido');
        setLoading(false);
        return;
      }

      // Enviar correo de recuperación con Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError('Error al enviar el correo: ' + resetError.message);
        setLoading(false);
        return;
      }

      setMessage('¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.');
      setEmail('');
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      console.error('Error de recuperación:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-page">
      <div className="recuperar-container">
        <div className="recuperar-header">
          <h1>Recuperar Contraseña</h1>
          <p>Ingresa tu correo para recibir las instrucciones</p>
        </div>

        <form className="recuperar-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span>⚠</span> {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              <span>✓</span> {message}
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

          <button type="submit" className="recuperar-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Enviando...
              </>
            ) : (
              'Enviar Correo'
            )}
          </button>

          <div className="login-link">
            ¿Recordaste tu contraseña? <Link to="/login">Inicia sesión aquí</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecuperarPassword;
