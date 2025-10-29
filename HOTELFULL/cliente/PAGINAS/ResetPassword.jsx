import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient';
import '../ESTILOS/ResetPassword.css';
import { useTranslation } from 'react-i18next'
function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Verificar si el usuario llegó desde el link del correo
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError(t('resetpwd.text1'));
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validación básica
      if (!password || !confirmPassword) {
        setError(t('resetpwd.text2'));
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError(t('resetpwd.text3'));
        setLoading(false);
        return;
      }

      // Validar contraseña fuerte (al menos una letra y un número)
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
      if (!passwordRegex.test(password)) {
        setError(t('resetpwd.text4'));
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError(t('resetpwd.text5'));
        setLoading(false);
        return;
      }

      // Actualizar contraseña con Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        // Traducir errores comunes de Supabase al español
        let mensajeError = t('resetpwd.title1');

        if (updateError.message.includes('same as the old password')) {
          mensajeError =  t('resetpwd.title2');

          // Supabase envía error en INGLÉS. El código BUSCA esa frase en inglés:
//    if (updateError.message.includes('Password should be at least'))
   
// 3. Si la encuentra, MUESTRA el mensaje en ESPAÑOL al usuario:
//    mensajeError = 'La contraseña debe tener al menos 6 caracteres'
        } else if (updateError.message.includes('Password should be at least')) {
          mensajeError = t('resetpwd.title3');
        } else if (updateError.message.includes('weak')) {
          mensajeError = t('resetpwd.title4');
        } else {
          mensajeError =  t('resetpwd.title5') + updateError.message;
        }

        setError(mensajeError);
        setLoading(false);
        return;
      }

      // Cerrar sesión después de cambiar contraseña
      await supabase.auth.signOut();

      alert(t('resetpwd.alert1'));
      navigate('/login');
    } catch (err) {
      setError(t('resetpwd.alert2'));
      console.error(t('resetpwd.alert3'), err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-container">
        <div className="reset-header">
          <h1>{t('resetpwd.title')}</h1>
          <p>{t('resetpwd.subtitle')}</p>
        </div>

        <form className="reset-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">{t('resetpwd.newpwd')}</label>
            <div className="input-wrapper">
              
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder={t('resetpwd.placeholder1')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('resetpwd.confirmpwd')}</label>
            <div className="input-wrapper">
              
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder={t('resetpwd.placeholder2')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                {t('resetpwd.act')}

              </>
            ) : (
              t('resetpwd.actualizar')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
