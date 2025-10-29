import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient';
import '../ESTILOS/RecuperarPassword.css';
import { useTranslation } from 'react-i18next'

function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Validación básica
      if (!email) {
        setError(t('recupwd.text1'));
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError(t('recupwd.text2'));
        setLoading(false);
        return;
      }

      // Enviar correo de recuperación con Supabase
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(t('recupwd.text3') + resetError.message);
        setLoading(false);
        return;
      }

      setMessage(t('recupwd.text4'));
      setEmail('');
    } catch (err) {
      setError(t('recupwd.text5'));
      console.error(t('recupwd.text6'), err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-page">
      <div className="recuperar-container">
        <div className="recuperar-header">
          <h1>{t('recupwd.title1')}</h1>
          <p>{t('recupwd.title2')}</p>
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
            <label htmlFor="email">{t('recupwd.email')}</label>
            <div className="input-wrapper">
              <span className="input-icon"></span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={t('recupwd.tumail')}
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
                t('recupwd.send')
              </>
            ) : (
              t('recupwd.enviar')
            )}
          </button>

          <div className="login-link">
            {t('recupwd.recordar')}
            <Link to="/login">{t('recupwd.sesion')}</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecuperarPassword;
