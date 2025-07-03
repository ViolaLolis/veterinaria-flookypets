// src/Pages/InicioAdministrador/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaStethoscope, FaCalendarAlt, FaNotesMedical, FaCog, FaSignOutAlt, FaUserCircle, FaBars, FaTimes, FaChartBar, FaUserShield, FaBriefcaseMedical } from 'react-icons/fa';
import './Styles/AdminDashboard.css'; // Asegúrate de que este CSS exista
import { useNotifications } from '../../Notifications/NotificationContext'; // Importa el hook de notificaciones

function AdminDashboard({ user, setUser, handleLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { notifications, markNotificationAsRead, removeNotification, clearAllNotifications } = useNotifications(); // Usa el hook de notificaciones
    const unreadCount = notifications.filter(notif => !notif.leida).length;

    useEffect(() => {
        // Redirigir si el usuario no es admin o no está logueado
        if (!user || user.role !== 'admin') {
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    const handleLogoutClick = () => {
        handleLogout(); // Llama a la función de logout pasada desde App.js
        navigate('/login', { replace: true });
    };

    // Función para obtener la clase CSS activa para el enlace de navegación
    const getNavLinkClass = (path) => {
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    return (
        <div className="admin-dashboard-container">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Flooky Pets Admin</h3>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
                        <FaTimes />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li>
                            <Link to="dashboard" className={getNavLinkClass('/admin/dashboard')}>
                                <FaTachometerAlt className="nav-icon" /> Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="services" className={getNavLinkClass('/admin/services')}>
                                <FaBriefcaseMedical className="nav-icon" /> Gestión de Servicios
                            </Link>
                        </li>
                        <li>
                            <Link to="veterinarians" className={getNavLinkClass('/admin/veterinarians')}>
                                <FaStethoscope className="nav-icon" /> Gestión de Veterinarios
                            </Link>
                        </li>
                        <li>
                            <Link to="administrators" className={getNavLinkClass('/admin/administrators')}>
                                <FaUserShield className="nav-icon" /> Gestión de Administradores
                            </Link>
                        </li>
                        <li>
                            <Link to="users" className={getNavLinkClass('/admin/users')}>
                                <FaUsers className="nav-icon" /> Gestión de Clientes
                            </Link>
                        </li>
                        <li>
                            <Link to="appointments" className={getNavLinkClass('/admin/appointments')}>
                                <FaCalendarAlt className="nav-icon" /> Gestión de Citas
                            </Link>
                        </li>
                        <li>
                            <Link to="medical-records" className={getNavLinkClass('/admin/medical-records')}>
                                <FaNotesMedical className="nav-icon" /> Historiales Médicos
                            </Link>
                        </li>
                        <li>
                            <Link to="settings" className={getNavLinkClass('/admin/settings')}>
                                <FaCog className="nav-icon" /> Configuración
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <Link to="profile" className={getNavLinkClass('/admin/profile')}>
                        <FaUserCircle className="nav-icon" /> Mi Perfil
                    </Link>
                    <button onClick={handleLogoutClick} className="logout-btn">
                        <FaSignOutAlt className="nav-icon" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main-content">
                <header className="admin-header">
                    <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <FaBars />
                    </button>
                    <h1>Bienvenido, {user?.nombre}</h1>
                    <div className="header-right">
                        {/* Notificaciones */}
                        <div className="relative">
                            <button
                                className="notification-bell-btn"
                                onClick={() => navigate('/admin/notifications')} // Podrías tener una ruta específica para ver todas las notificaciones
                                title="Ver Notificaciones"
                            >
                                <FaCalendarAlt className="nav-icon" /> {/* Icono de campana o similar */}
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>
                            {/* Aquí podrías integrar un panel desplegable de notificaciones si no tienes una página dedicada */}
                        </div>
                        <div className="user-info">
                            <FaUserCircle className="user-avatar-icon" />
                            <span>{user?.nombre}</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content-area">
                    {/* El Outlet renderiza los componentes de ruta anidados */}
                    <Outlet context={{ user, setUser, handleLogout }} /> {/* Pasa user y setUser a los componentes anidados */}
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
