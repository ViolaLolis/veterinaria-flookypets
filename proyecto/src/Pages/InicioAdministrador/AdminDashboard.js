import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt, FaUsers, FaStethoscope, FaUserShield, FaBriefcaseMedical,
    FaCalendarAlt, FaNotesMedical, FaCog, FaSignOutAlt, FaUserCircle,
    FaBars, FaTimes
} from 'react-icons/fa';
import './Styles/AdminDashboard.css';

function AdminDashboard({ user, setUser, handleLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const sidebarRef = useRef(null);

    // Redirige si el usuario no es admin o no está logueado
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    // Maneja clics fuera del sidebar para cerrarlo
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
    }, [sidebarRef, isSidebarOpen]);

    const handleLogoutClick = () => {
        handleLogout();
        navigate('/login', { replace: true });
    };

    const getNavLinkClass = (path) => {
        return location.pathname.startsWith(path) ? 'admin-nav-item active' : 'admin-nav-item';
    };

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