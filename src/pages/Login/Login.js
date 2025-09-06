// src/pages/Login/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.scss';

// Iconos
import {
    FaLock,
    FaEye,
    FaEyeSlash,
    FaEnvelope,
    FaBuilding
} from 'react-icons/fa';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar envío de login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            alert('Por favor completa todos los campos');
            return;
        }

        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (error) {
            // El error ya se maneja en el hook
        } finally {
            setLoading(false);
        }
    };

    // Recuperar contraseña
    const handleForgotPassword = () => {
        alert('Contacta al administrador del sistema para recuperar tu contraseña');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <div className="logo">
                        <FaBuilding size={48} />
                    </div>
                    <h1>Enlaces EPN</h1>
                    <p>Empresas Públicas de Neiva</p>
                    <p className="subtitle">Sistema de Gestión de Llamadas</p>
                </div>

                {/* Formulario */}
                <div className="login-form-container">
                    <h2>Iniciar Sesión</h2>

                    <form onSubmit={handleLoginSubmit}>
                        {/* Email */}
                        <div className="input-group">
                            <div className="input-icon">
                                <FaEnvelope />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        {/* Contraseña */}
                        <div className="input-group">
                            <div className="input-icon">
                                <FaLock />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        {/* Botón de envío */}
                        <button
                            type="submit"
                            className={`submit-btn ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    {/* Enlaces adicionales */}
                    <div className="form-links">
                        <button
                            type="button"
                            className="link-button"
                            onClick={handleForgotPassword}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    {/* Información adicional */}
                    <div className="login-info">
                        <p>Para crear una cuenta nueva, contacta al administrador del sistema.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;