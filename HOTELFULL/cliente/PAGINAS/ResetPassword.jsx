import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../SERVICIOS/supabaseClient';
import '../ESTILOS/ResetPassword.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario llegó desde el link del correo
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Sesión inválida o expirada. Por favor, solicita un nuevo enlace de recuperación.');
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
        setError('Por favor, completa todos los campos');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres con 1 letra ');
        setLoading(false);
        return;
      }

      // Validar contraseña fuerte (al menos una letra y un número)
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
      if (!passwordRegex.test(password)) {
        setError('La contraseña debe contener al menos una letra y un número');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Actualizar contraseña con Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        // Traducir errores comunes de Supabase al español
        let mensajeError = 'Error al actualizar la contraseña';

        if (updateError.message.includes('same as the old password')) {
          mensajeError = 'La nueva contraseña no puede ser igual a la anterior';

          // Supabase envía error en INGLÉS. El código BUSCA esa frase en inglés:
//    if (updateError.message.includes('Password should be at least'))
   
// 3. Si la encuentra, MUESTRA el mensaje en ESPAÑOL al usuario:
//    mensajeError = 'La contraseña debe tener al menos 6 caracteres'
        } else if (updateError.message.includes('Password should be at least')) {
          mensajeError = 'La contraseña debe tener al menos 6 caracteres';
        } else if (updateError.message.includes('weak')) {
          mensajeError = 'La contraseña es demasiado débil';
        } else {
          mensajeError = 'Error al actualizar la contraseña: ' + updateError.message;
        }

        setError(mensajeError);
        setLoading(false);
        return;
      }

      // Cerrar sesión después de cambiar contraseña
      await supabase.auth.signOut();

      alert('¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      console.error('Error al resetear contraseña:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-container">
        <div className="reset-header">
          <h1>Nueva Contraseña</h1>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        <form className="reset-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <div className="input-wrapper">
              
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
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
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="input-wrapper">
              
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repite tu contraseña"
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
                Actualizando...

              </>
            ) : (
              'Cambiar Contraseña'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
