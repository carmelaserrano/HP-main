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
  const [hasSession, setHasSession] = useState(null); // null = verificando, true = tiene sesión, false = no tiene
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Verificar si el usuario llegó desde el link del correo
    const checkSession = async () => {
      console.log('🔍 Verificando sesión para reset password...');

      // Primero revisar el hash de la URL (token de recuperación)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      console.log('🔑 Token de acceso encontrado:', accessToken ? 'SÍ' : 'NO');
      console.log('📝 Tipo de evento:', type);

      // Si hay tokens en la URL pero no hay sesión, establecerla
      if (accessToken && type === 'recovery') {
        console.log('✅ Detectado link de recuperación válido, estableciendo sesión...');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('❌ Error al establecer sesión:', error);
          setError('El link de recuperación es inválido o ha expirado. Redirigiendo al login...');
          setHasSession(false);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        console.log('✅ Sesión establecida correctamente:', data);
        setHasSession(true);
      } else {
        // Verificar sesión existente
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.log('❌ No hay sesión activa');
          setError('El link de recuperación es inválido o ha expirado. Redirigiendo al login...');
          setHasSession(false);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          console.log('✅ Sesión activa encontrada');
          setHasSession(true);
        }
      }
    };

    checkSession();
  }, [navigate, t]);

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

  // Mostrar mensaje de carga mientras verifica la sesión
  if (hasSession === null) {
    return (
      <div className="reset-page">
        <div className="reset-container">
          <div className="reset-header">
            <h1>Verificando link de recuperación...</h1>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span className="spinner"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay sesión válida, mostrar error
  if (hasSession === false) {
    return (
      <div className="reset-page">
        <div className="reset-container">
          <div className="reset-header">
            <h1>Link Inválido</h1>
            <div className="error-message" style={{ marginTop: '20px' }}>
              <span>⚠</span> {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario normal si hay sesión válida
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
