import React from 'react';

function Login() {
  return (
    <div className="login-page">
      <h1>Login</h1>
      <form>
        <label>
          Usuario:
          <input type="text" name="username" />
        </label>
        <br />
        <label>
          Contraseña:
          <input type="password" name="password" />
        </label>
        <br />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;