import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt, FaUsers, FaStethoscope, FaUserShield, FaBriefcaseMedical,
    FaCalendarAlt, FaNotesMedical, FaCog, FaSignOutAlt, FaUserCircle,
    FaBars, FaTimes // Se eliminaron FaBell y FaCheckCircle ya que no se usan en el código activo
} from 'react-icons/fa';
import './Styles/AdminDashboard.css';
// Se eliminó la importación de useNotifications, ya que las notificaciones en el header están comentadas
// import { useNotifications } from '../../Notifications/NotificationContext';

function AdminDashboard({ user, setUser, handleLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Se eliminó isNotificationsDropdownOpen, ya no se usa
    // const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Se eliminaron todas las variables relacionadas con useNotifications
    // const { notifications, markAsRead, clearNotifications } = useNotifications();
    // const unreadCount = notifications.filter(notif => !notif.leida).length;

    // Se eliminó notificationsRef, ya no se usa
    // const notificationsRef = useRef(null);
    const sidebarRef = useRef(null);

    // Redirige si el usuario no es admin o no está logueado
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    // Maneja clics fuera del sidebar para cerrarlo (modificado para quitar la lógica de notificaciones)
    useEffect(() => {
        function handleClickOutside(event) {
            // Cierra el sidebar en móvil si se hace clic fuera, pero no en el botón de toggle
            if (window.innerWidth <= 768 && sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarOpen) {
                const menuToggleBtn = document.querySelector('.menu-toggle-btn');
                if (menuToggleBtn && !menuToggleBtn.contains(event.target)) {
                    setIsSidebarOpen(false);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [sidebarRef, isSidebarOpen]); // notificationsRef eliminado de las dependencias

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/login', { replace: true });
    };

    const getNavLinkClass = (path) => {
        return location.pathname.startsWith(path) ? 'admin-nav-item active' : 'admin-nav-item';
    };

    // Se eliminó toggleNotificationsDropdown, ya no se usa
    // const toggleNotificationsDropdown = () => {
    //     setIsNotificationsDropdownOpen(prevState => !prevState);
    // };

<<<<<<< HEAD
    // Filtra las notificaciones para mostrar solo las relevantes para el admin
    const adminNotifications = notifications.filter(notif => {
        const adminKeywords = [
            'nueva cita',
            'nuevo usuario registrado',
            'nueva mascota agregada',
            'cita cancelada',
            'registro de pago',
            'cita reagendada' // Ejemplo adicional de palabra clave
            // Agrega más palabras clave relevantes para el admin aquí
        ];
        // Comprueba si el mensaje de la notificación contiene alguna de las palabras clave (insensible a mayúsculas/minúsculas)
        return adminKeywords.some(keyword => notif.mensaje.toLowerCase().includes(keyword.toLowerCase()));
    });
=======
    // Se eliminó adminNotifications, ya no se usa
    // const adminNotifications = notifications.filter(notif => {
    //     const adminKeywords = [
    //         'nueva cita', 'nuevo usuario registrado', 'nueva mascota agregada',
    //         'cita cancelada', 'registro de pago', 'veterinario', 'servicio',
    //         'historial', 'cliente', 'modificado', 'eliminado', 'creado'
    //     ];
    //     return adminKeywords.some(keyword => notif.mensaje.toLowerCase().includes(keyword));
    // });
>>>>>>> b52706bdbf5afa1c9dd8a3d71e2cbc06e3c93b05

    return (
        <div className="admin-dashboard-container">
            {/* Sidebar (barra lateral izquierda) */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
                <div className="admin-sidebar-header">
                    <div className="admin-logo-container">
                        <FaStethoscope className="admin-logo-icon" />
                        <h2>Flooky Pets</h2>
                    </div>
                    <p className="admin-clinic-name">Panel de Administración</p>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Cerrar menú">
                        <FaTimes />
                    </button>
                </div>

                <div className="admin-user-profile">
                    <div className="admin-avatar">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Avatar de usuario" className="admin-avatar-image" />
                        ) : (
                            <FaUserCircle />
                        )}
                    </div>
                    <div className="admin-user-info">
                        <h3>{user?.nombre}</h3>
                        <p>{user?.role === 'admin' ? 'Administrador' : user?.role}</p>
                        <Link to="profile" className="admin-profile-button" onClick={() => setIsSidebarOpen(false)}>
                            Ver Perfil
                        </Link>
                    </div>
                </div>

                <nav className="admin-nav-menu">
                    <ul>
                        <li>
                            <Link to="dashboard" className={getNavLinkClass('/admin/dashboard')} onClick={() => setIsSidebarOpen(false)}>
                                <FaTachometerAlt className="admin-nav-icon" /> Dashboard
                                {location.pathname.startsWith('/admin/dashboard') && <span className="admin-active-indicator"></span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="services" className={getNavLinkClass('/admin/services')} onClick={() => setIsSidebarOpen(false)}>
                                <FaBriefcaseMedical className="admin-nav-icon" /> Gestión de Servicios
                                {location.pathname.startsWith('/admin/services') && <span className="admin-active-indicator"></span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="veterinarians" className={getNavLinkClass('/admin/veterinarians')} onClick={() => setIsSidebarOpen(false)}>
                                <FaStethoscope className="admin-nav-icon" /> Gestión de Veterinarios
                                {location.pathname.startsWith('/admin/veterinarians') && <span className="admin-active-indicator"></span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="administrators" className={getNavLinkClass('/admin/administrators')} onClick={() => setIsSidebarOpen(false)}>
                                <FaUserShield className="admin-nav-icon" /> Gestión de Administradores
                                {location.pathname.startsWith('/admin/administrators') && <span className="admin-active-indicator"></span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="users" className={getNavLinkClass('/admin/users')} onClick={() => setIsSidebarOpen(false)}>
                                <FaUsers className="admin-nav-icon" /> Gestión de Clientes
                                {location.pathname.startsWith('/admin/users') && <span className="admin-active-indicator"></span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="appointments" className={getNavLinkClass('/admin/appointments')} onClick={() => setIsSidebarOpen(false)}>
                                <FaCalendarAlt className="admin-nav-icon" /> Gestión de Citas
                                {location.pathname.startsWith('/admin/appointments') && <span className="admin-active-indicator"></span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="medical-records" className={getNavLinkClass('/admin/medical-records')} onClick={() => setIsSidebarOpen(false)}>
                                <FaNotesMedical className="admin-nav-icon" /> Historiales Médicos
                                {location.pathname.startsWith('/admin/medical-records') && <span className="admin-active-indicator"></span>}
                            </Link>
                        </li>
                        <li>
                            <Link to="settings" className={getNavLinkClass('/admin/settings')} onClick={() => setIsSidebarOpen(false)}>
                                <FaCog className="admin-nav-icon" /> Configuración
                                {location.pathname.startsWith('/admin/settings') && <span className="admin-active-indicator"></span>}
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogoutClick} className="admin-logout-button">
                        <FaSignOutAlt className="admin-nav-icon" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="admin-main-content">
                <header className="admin-header">
                    <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Abrir menú">
                        <FaBars />
                    </button>
                    <h1>Flooky Pets</h1>

                    {/* La sección header-right fue comentada anteriormente, por lo que no se incluye en el código activo. */}
                    {/* Si necesitas re-habilitar las notificaciones o el perfil en el encabezado, descomenta este bloque
                        y las variables, estados e imports relacionados que se eliminaron arriba. */}
                    {/*
                    <div className="header-right">
                        <span className="admin-role-text">Admin</span>

                        <div className="notification-container" ref={notificationsRef}>
                            <button
                                className="admin-notification-bell-btn"
                                onClick={toggleNotificationsDropdown}
                                title="Ver Notificaciones"
                                aria-expanded={isNotificationsDropdownOpen}
                                aria-controls="admin-notifications-dropdown"
                            >
                                <FaBell className="admin-bell-icon" />
                                {unreadCount > 0 && (
                                    <span className="admin-notification-badge">{unreadCount}</span>
                                )}
                            </button>

                            {isNotificationsDropdownOpen && (
                                <div id="admin-notifications-dropdown" className="admin-notifications-dropdown">
                                    <h3>Notificaciones ({unreadCount} no leídas)</h3>
                                    {adminNotifications.length > 0 ? (
                                        <>
                                            <ul>
                                                {adminNotifications
                                                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                                                    .map((notif) => (
                                                        <li key={notif.id} className={notif.leida ? 'read' : 'unread'}>
                                                            <div className="notification-content">
                                                                <p className="notification-message">{notif.mensaje}</p>
                                                                <span className="notification-date">
                                                                    {new Date(notif.fecha).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {!notif.leida && (
                                                                <button
                                                                    className="admin-mark-as-read-button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        markAsRead(notif.id);
                                                                    }}
                                                                    title="Marcar como leída"
                                                                >
                                                                    <FaCheckCircle />
                                                                </button>
                                                            )}
                                                        </li>
                                                    ))}
                                            </ul>
                                            {unreadCount > 0 && (
                                                <button onClick={clearNotifications} className="admin-clear-all-notifications-button">
                                                    Marcar todas como leídas
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <p className="no-notifications-message">No hay notificaciones para mostrar.</p>
                                    )}
                                </div>
                            )}
                        </div>

<<<<<<< HEAD
                        {/* Información de usuario y foto de perfil */}
                        <div className="user-info">
                            {user?.imagen_url ? (
                                <img src={user.imagen_url} alt="Avatar de Usuario" className="user-avatar" />
                            ) : (
                                <FaUserCircle className="user-avatar-icon" />
                            )}
=======
                        <div className="admin-user-profile-header">
                            <div className="admin-avatar-header">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Avatar de usuario" className="admin-avatar-image-header" />
                                ) : (
                                    <FaUserCircle className="admin-user-avatar-icon" />
                                )}
                            </div>
>>>>>>> b52706bdbf5afa1c9dd8a3d71e2cbc06e3c93b05
                            <span>{user?.nombre}</span>
                        </div>
                    </div>
                    */}
                </header>

                {/* Área donde se renderizan los componentes de las rutas anidadas */}
                <div className="admin-content-area">
                    <Outlet context={{ user, setUser, handleLogout }} />
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;