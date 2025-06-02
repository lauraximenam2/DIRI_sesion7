// src/pages/RegisterPage.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import logger from '../services/logging';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    logger.info(`Intento de registro para: ${email}`);
    try {
      await authService.signUp(email, password);
      // La asignación de roles por defecto sucede en FirebaseAuthService
      logger.info(`Registro exitoso para: ${email}. Roles por defecto asignados.`);
      setSuccess('¡Registro exitoso! Redirigiendo...');
      setTimeout(() => {
        navigate('/order'); 
      }, 2000);
    } catch (err: any) {
      logger.error(`Error de registro para ${email}:`, err);
      setError(err.message || 'Error al registrar. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleRegister}>
        <h2>Registrarse</h2>
        <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Registrarse</button>
        {error && <p className="errorMessage">{error}</p>}
        {success && <p className="successMessage">{success}</p>}
      </form>
    </div>
  );
};
export default RegisterPage;