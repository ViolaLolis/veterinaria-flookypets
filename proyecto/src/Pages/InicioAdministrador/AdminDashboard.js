import React, { useState, useEffect, useRef } from 'react'; // Importa useRef
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt, FaUsers, FaStethoscope, FaUserShield, FaBriefcaseMedical,
    FaCalendarAlt, FaNotesMedical, FaCog, FaSignOutAlt, FaUserCircle,
    FaBars, FaTimes, FaBell, FaCheckCircle // Importa FaBell y FaCheckCircle
} from 'react-icons/fa';
import './Styles/AdminDashboard.css';
import { useNotifications } from '../../Notifications/NotificationContext';

function AdminDashboard({ user, setUser, handleLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false); // Estado para el dropdown
    const navigate = useNavigate();
    const location = useLocation();
    const { notifications, markAsRead, clearNotifications } = useNotifications(); // Usa funciones del contexto
    const unreadCount = notifications.filter(notif => !notif.leida).length;

    // Ref para detectar clics fuera del dropdown de notificaciones
    const notificationsRef = useRef(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    // Maneja clics fuera del dropdown para cerrarlo
    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationsRef]);

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/login', { replace: true });
    };

    const getNavLinkClass = (path) => {
        return location.pathname.startsWith(path) ? 'active' : '';
    };

    const toggleNotificationsDropdown = () => {
        setIsNotificationsDropdownOpen(prevState => !prevState);
    };

    // Filtra las notificaciones para mostrar solo las relevantes para el admin
    const adminNotifications = notifications.filter(notif => {
        const adminKeywords = [
            'nueva cita',
            'nuevo usuario registrado',
            'nueva mascota agregada',
            'cita cancelada',
            'registro de pago'
            // Agrega más palabras clave relevantes para el admin
        ];
        return adminKeywords.some(keyword => notif.mensaje.toLowerCase().includes(keyword));
    });

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
                        <div className="notification-container" ref={notificationsRef}> {/* Usa la ref aquí */}
                            <button
                                className="notification-bell-btn"
                                onClick={toggleNotificationsDropdown}
                                title="Ver Notificaciones"
                            >
                                <FaBell className="nav-icon" /> {/* Icono de campana */}
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>

                            {/* Menú desplegable de notificaciones */}
                            {isNotificationsDropdownOpen && (
                                <div className="admin-notifications-dropdown">
                                    <h3>Notificaciones ({unreadCount} no leídas)</h3>
                                    {adminNotifications.length > 0 ? (
                                        <>
                                            <ul>
                                                {adminNotifications
                                                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Opcional: ordenar por fecha
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
                                                                    className="mark-as-read-button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Evita que se cierre el dropdown
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
                                                <button onClick={clearNotifications} className="clear-all-notifications-button">
                                                    Marcar todas como leídas
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <p>No hay notificaciones para mostrar.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="user-info">
                            <FaUserCircle className="user-avatar-icon" />
                            <span>{user?.nombre}</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content-area">
                    <Outlet context={{ user, setUser, handleLogout }} />
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;