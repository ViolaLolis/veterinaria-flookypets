import React, { useState } from 'react'; // Importa useState
import './Styles/AdminSidebar.css';
import { 
    FaTachometerAlt, 
    FaConciergeBell, 
    FaUserMd, 
    FaUserShield, 
    FaUserCog, 
    FaUsers, 
    FaCalendarAlt, 
    FaNotesMedical, 
    FaCog,
    FaChevronDown, // Icono para indicar desplegable
    FaChevronUp,   // Icono para indicar replegado
    FaPaw          // Icono para Mascotas
} from 'react-icons/fa'; // Importa los iconos de Font Awesome

function AdminSidebar({ activeTab, setActiveTab }) {
    // Estado para controlar la visibilidad del submenú de Usuarios
    const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);

    const handleToggleUsersMenu = () => {
        setIsUsersMenuOpen(!isUsersMenuOpen);
    };

    const handleMenuItemClick = (tabName) => {
        setActiveTab(tabName);
        // Opcional: si quieres cerrar el submenú al seleccionar un elemento
        // setIsUsersMenuOpen(false); 
    };

    return (
        <aside className="admin-sidebar">
            <nav>
                <ul>
                    {/* Dashboard - Siempre primero */}
                    <li
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => handleMenuItemClick('dashboard')}
                    >
                        <FaTachometerAlt className="sidebar-icon" />
                        <span>Dashboard</span>
                    </li>
                    
                    {/* Menú desplegable para Usuarios */}
                    <li 
                        className={`sidebar-dropdown-parent ${isUsersMenuOpen || activeTab === 'administrators' || activeTab === 'veterinarians' || activeTab === 'users' ? 'active open' : ''}`}
                        onClick={handleToggleUsersMenu} // Click para expandir/colapsar
                    >
                        <FaUsers className="sidebar-icon" />
                        <span>Usuarios</span>
                        {isUsersMenuOpen ? <FaChevronUp className="dropdown-arrow" /> : <FaChevronDown className="dropdown-arrow" />}
                    </li>
                    <div className={`sidebar-submenu ${isUsersMenuOpen ? 'open' : ''}`}>
                        <ul>
                            <li
                                className={activeTab === 'administrators' ? 'active' : ''}
                                onClick={() => handleMenuItemClick('administrators')}
                            >
                                <FaUserShield className="sidebar-icon submenu-icon" />
                                <span>Administradores</span>
                            </li>
                            <li
                                className={activeTab === 'veterinarians' ? 'active' : ''}
                                onClick={() => handleMenuItemClick('veterinarians')}
                            >
                                <FaUserMd className="sidebar-icon submenu-icon" />
                                <span>Veterinarios</span>
                            </li>
                            <li
                                className={activeTab === 'users' ? 'active' : ''}
                                onClick={() => handleMenuItemClick('users')}
                            >
                                <FaUsers className="sidebar-icon submenu-icon" />
                                <span>Propietarios</span> {/* Renombrado de "Usuarios" a "Propietarios" */}
                            </li>
                        </ul>
                    </div>

                    {/* Historiales Médicos */}
                    <li
                        className={activeTab === 'medical-records' ? 'active' : ''}
                        onClick={() => handleMenuItemClick('medical-records')}
                    >
                        <FaNotesMedical className="sidebar-icon" />
                        <span>Historiales Médicos</span>
                    </li>

                    {/* Citas */}
                    <li
                        className={activeTab === 'appointments' ? 'active' : ''}
                        onClick={() => handleMenuItemClick('appointments')}
                    >
                        <FaCalendarAlt className="sidebar-icon" />
                        <span>Citas</span>
                    </li>
                    
                    {/* Servicios */}
                    <li
                        className={activeTab === 'services' ? 'active' : ''}
                        onClick={() => handleMenuItemClick('services')}
                    >
                        <FaConciergeBell className="sidebar-icon" />
                        <span>Servicios</span>
                    </li>

                    {/* Mi Perfil */}
                    <li
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => handleMenuItemClick('profile')}
                    >
                        <FaUserCog className="sidebar-icon" />
                        <span>Mi Perfil</span>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default AdminSidebar;
