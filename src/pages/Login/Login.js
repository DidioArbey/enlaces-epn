// src/pages/Login/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.scss';

// 🎨 Iconos
import {
    FaUser,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaEnvelope,
    FaBuilding
} from 'react-icons/fa';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        department: ''
    });

    const { login, register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // 🔄 Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // 📝 Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 🔑 Manejar envío de login
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

    // 📝 Manejar envío de registro
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password || !formData.displayName) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (formData.password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await register(formData.email, formData.password, {
                displayName: formData.displayName,
                department: formData.department,
                role: 'operator'
            });
            navigate('/dashboard');
        } catch (error) {
            // El error ya se maneja en el hook
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* 🏢 Header */}
                <div className="login-header">
                    <div className="logo">
                        <FaBuilding size={48} />
                    </div>
                    <h1>Enlaces EPN</h1>
                    <p>Empresas Públicas de Neiva</p>
                </div>

                {/* 📋 Formulario */}
                <div className="login-form-container">
                    <div className="form-tabs">
                        <button
                            className={`tab ${isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(true)}
                            type="button"
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            className={`tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(false)}
                            type="button"
                        >
                            Registrarse
                        </button>
                    </div>

                    <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}>
                        {/* 👤 Nombre (solo en registro) */}
                        {!isLogin && (
                            <div className="input-group">
                                <div className="input-icon">
                                    <FaUser />
                                </div>
                                <input
                                    type="text"
                                    name="displayName"
                                    placeholder="Nombre completo"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {/* 🏢 Departamento (solo en registro) */}
                        {!isLogin && (
                            <div className="input-group">
                                <div className="input-icon">
                                    <FaBuilding />
                                </div>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccionar departamento</option>
                                    <option value="atencion-cliente">Atención al Cliente</option>
                                    <option value="acueducto">Acueducto</option>
                                    <option value="energia">Energía</option>
                                    <option value="administracion">Administración</option>
                                    <option value="tecnico">Técnico</option>
                                </select>
                            </div>
                        )}

                        {/* 📧 Email */}
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
                            />
                        </div>

                        {/* 🔒 Contraseña */}
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
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        {/* 🔒 Confirmar contraseña (solo en registro) */}
                        {!isLogin && (
                            <div className="input-group">
                                <div className="input-icon">
                                    <FaLock />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirmar contraseña"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {/* 🔄 Botón de envío */}
                        <button
                            type="submit"
                            className={`submit-btn ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* 🔗 Enlaces adicionales */}
                    <div className="form-links">
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin
                                ? '¿No tienes cuenta? Regístrate'
                                : '¿Ya tienes cuenta? Inicia sesión'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;