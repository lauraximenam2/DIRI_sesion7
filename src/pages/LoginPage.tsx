// src/pages/LoginPage.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import logger from '../services/logging';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    logger.info(`Intento de login para: ${email}`);
    
    try {
      await authService.signIn(email, password);
      logger.info(`Login exitoso para: ${email}`);
      navigate('/order');
    } catch (err: any) {
      logger.error(`Error de login para ${email}:`, err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>
        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
        {error && <p className="errorMessage">{error}</p>}
      </form>
    </div>
  );
};
export default LoginPage;