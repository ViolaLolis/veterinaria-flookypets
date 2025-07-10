import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Main from "./Pages/Inicio/Main";
import Login from "./Pages/Login/Login.js";
import Registro from "./Pages/Login/Registro.js";
import ForgotPassword from "./Pages/Login/OlvideContraseña.js";
import styles from './App.css'; // Asegúrate de que este import sea correcto o que App.css exista y se use.


// Componentes de Usuario
import InicioUsuario from "./Pages/InicioUsuario/InicioUsuario.js";
import HomeDashboard from "./Pages/InicioUsuario/InicioDashboard.js";
import CitasUsuario from "./Pages/InicioUsuario/CitasUsuario.js";
import ServiciosVeterinaria from "./Pages/InicioUsuario/ServiciosVeterinaria.js";
import PerfilUsuario from "./Pages/InicioUsuario/PerfilUsuario.js";
import ConfiguracionPerfil from "./Pages/InicioUsuario/ConfiguracionPerfil.js";
import HistorialMedico from "./Pages/InicioUsuario/HistorialMedico.js";
import AgendarCita from "./Pages/InicioUsuario/AgendarCita.js";
import DetalleMascota from "./Pages/InicioUsuario/DetalleMascota.js";
import EditarMascota from "./Pages/InicioUsuario/EditarMascota.js";
import DetalleCita from "./Pages/InicioUsuario/DetalleCita.js";
import EditarPerfil from "./Pages/InicioUsuario/EditarPerfil.js";
import DetalleServicio from "./Pages/InicioUsuario/DetalleServicio.js";
import DetalleHistorial from "./Pages/InicioUsuario/DetalleHistorial.js";
import ListaMascotasUsuario from "./Pages/InicioUsuario/ListaMascotasUsuario.js";

// Componentes de Veterinario
import ListaPropietarios from "./Pages/InicioVeterinario/ListaPropietarios";
import DetallePropietario from "./Pages/InicioVeterinario/DetallePropietario";
import RegistrarPropietario from "./Pages/InicioVeterinario/RegistrarPropietario";
import EditarPropietario from "./Pages/InicioVeterinario/EditarPropietario";
import ListaMascotasVeterinario from "./Pages/InicioVeterinario/ListaMascotas";
import DetalleMascotaVeterinario from "./Pages/InicioVeterinario/DetalleMascota";
import RegistrarMascotaVeterinario from "./Pages/InicioVeterinario/RegistrarMascota";
import EditarMascotaVeterinario from "./Pages/InicioVeterinario/EditarMascota";
import ListaCitasVeterinario from "./Pages/InicioVeterinario/ListaCitasVeterinario";
import DetalleCitaVeterinario from "./Pages/InicioVeterinario/DetalleCitaVeterinario";
import ListaHistorialesVeterinario from "./Pages/InicioVeterinario/ListaHistoriales";
import DetalleHistorialVeterinario from "./Pages/InicioVeterinario/DetalleHistorialVeterinario";
import VerPerfilVeterinario from "./Pages/InicioVeterinario/VerPerfilVeterinario";
import EditarPerfilVeterinario from "./Pages/InicioVeterinario/EditarPerfilVeterinario";
import MainVeterinario from "./Pages/InicioVeterinario/MainVeterinario";
import NavegacionVeterinario from "./Pages/InicioVeterinario/NavegacionVeterinario";
import ConfiguracionVeterinario from "./Pages/InicioVeterinario/ConfiguracionVeterinario";
import CrearCitaVeterinario from "./Pages/InicioVeterinario/CrearCitaVeterinario";
import RegistrarHistorialMedico from "./Pages/InicioVeterinario/RegistrarHistorialMedico";
import EditarHistorialMedico from "./Pages/InicioVeterinario/EditarHistorialMedico";

// Componentes de Administrador
import AdminDashboard from "./Pages/InicioAdministrador/AdminDashboard";
import AdminStats from "./Pages/InicioAdministrador/AdminStats";
import AdminUserManagement from "./Pages/InicioAdministrador/AdminUserManagement";
import AdminAppointments from "./Pages/InicioAdministrador/AdminAppointments";
import AdminMedicalRecords from "./Pages/InicioAdministrador/AdminMedicalRecords";
import AdminSettings from "./Pages/InicioAdministrador/AdminSettings";
import ServicesManagement from "./Pages/InicioAdministrador/ServicesManagement";
import VetsManagement from "./Pages/InicioAdministrador/VetsManagement";
import AdminsManagement from "./Pages/InicioAdministrador/AdminsManagement";
import UserProfile from "./Pages/InicioAdministrador/UserProfile";

// Componente para proteger rutas
import { Protegida } from "./Seguridad/Protegidos.js";

// Importar el proveedor de notificaciones
import { NotificationProvider } from "./Notifications/NotificationContext.js";
// Importar el componente para mostrar las notificaciones
import NotificationDisplay from "./Notifications/NotificationDisplay.js";

// Componente de Ayuda (Temporalmente aquí, idealmente en un archivo separado)
const Ayuda = () => {
    // Definimos la paleta de colores basada en tus imágenes
    const colorPalette = {
        primaryBlue: '#00bcd4', // Un azul brillante, similar al de tu app (Header, botones)
        darkBlueText: '#007bff', // Un azul ligeramente más oscuro para texto importante o bordes
        lightGrayBackground: '#f9f9f9', // Fondo claro
        mediumGrayText: '#555', // Texto general
        darkGrayText: '#333', // Títulos
        buttonHoverBlue: '#008394', // Azul para el hover de los botones primarios
        buttonHoverGreen: '#218838' // Verde para el hover del botón de manual técnico
    };

    return (
        <div style={{
            padding: '20px',
            maxWidth: '800px',
            margin: 'auto',
            backgroundColor: colorPalette.lightGrayBackground,
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{
                color: colorPalette.darkGrayText,
                borderBottom: `2px solid ${colorPalette.primaryBlue}`, // Borde inferior con el azul primario
                paddingBottom: '10px',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                Tu Guía Completa de Flooky Pets
            </h2>
            <p style={{
                lineHeight: '1.6',
                fontSize: '1.1em',
                textAlign: 'center',
                marginBottom: '30px',
                color: colorPalette.mediumGrayText // Texto principal
            }}>
                ¡Hola! Bienvenido al centro de ayuda de Flooky Pets, tu compañero ideal para el cuidado de tus mascotas.
                Estamos aquí para que disfrutes al máximo de nuestra plataforma, con toda la información y soporte que necesitas.
                Explora nuestras secciones para resolver tus dudas rápidamente.
            </p>

            <h3 style={{ color: colorPalette.mediumGrayText, marginTop: '30px' }}>Preguntas Frecuentes (FAQ)</h3>
            <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                <li style={{ marginBottom: '10px' }}>
                    <strong style={{ color: colorPalette.darkGrayText }}>¿Cómo agendo una cita?</strong>
                    <p style={{ margin: '5px 0', color: colorPalette.mediumGrayText }}>Dirígete a "Mis Citas" y selecciona "Agendar Nueva Cita". Elige el servicio, veterinario y horario disponibles para brindarle la mejor atención a tu compañero.</p>
                </li>
                <li style={{ marginBottom: '10px' }}>
                    <strong style={{ color: colorPalette.darkGrayText }}>¿Dónde veo el historial médico de mi mascota?</strong>
                    <p style={{ margin: '5px 0', color: colorPalette.mediumGrayText }}>En "Mis Mascotas", selecciona a tu peludo amigo y luego haz clic en "Ver Historial Médico" para acceder a un registro detallado de su salud.</p>
                </li>
                <li style={{ marginBottom: '10px' }}>
                    <strong style={{ color: colorPalette.darkGrayText }}>¿Cómo actualizo mi información de perfil?</strong>
                    <p style={{ margin: '5px 0', color: colorPalette.mediumGrayText }}>Haz clic en tu nombre en la esquina superior derecha, luego selecciona "Mi Perfil" y después "Editar Perfil" para mantener tus datos actualizados.</p>
                </li>
                <li style={{ marginBottom: '10px' }}>
                    <strong style={{ color: colorPalette.darkGrayText }}>¿Quién puede agregar una nueva mascota a mi perfil?</strong>
                    <p style={{ margin: '5px 0', color: colorPalette.mediumGrayText }}>En Flooky Pets, la seguridad y precisión de los datos de tus mascotas es primordial. Solo nuestros veterinarios autorizados pueden agregar nuevas mascotas a tu perfil, asegurando que toda la información inicial sea correcta y validada profesionalmente.</p>
                </li>
            </ul>

            <h3 style={{ color: colorPalette.mediumGrayText, marginTop: '30px' }}>Manuales y Guías Detalladas</h3>
            <p style={{ lineHeight: '1.6', color: colorPalette.mediumGrayText }}>Para una comprensión más profunda de cómo funciona Flooky Pets y cómo sacarle el máximo provecho, te invitamos a descargar nuestros manuales:</p>
            <ul style={{ listStyleType: 'none', padding: '0', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <li style={{ marginBottom: '10px' }}>
                    <a
                        href="/pdfmanuales/Manual_Tecnico_Flooky_FINAL--.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            backgroundColor: colorPalette.primaryBlue, // Fondo del botón con el azul primario
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = colorPalette.buttonHoverBlue}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = colorPalette.primaryBlue}
                    >
                        Descargar Manual Técnico (PDF)
                    </a>
                </li>
                <li style={{ marginBottom: '10px' }}>
                    <a
                        href="/pdfmanuales/Manual_Usuario_Flooky-FINAL.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            backgroundColor: colorPalette.primaryBlue, // Fondo del botón con el azul primario
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '5px',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = colorPalette.buttonHoverBlue}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = colorPalette.primaryBlue}
                    >
                        Descargar Manual de Usuario (PDF)
                    </a>
                </li>
            </ul>

            <h3 style={{ color: colorPalette.mediumGrayText, marginTop: '30px' }}>Contacto de Soporte</h3>
            <p style={{ lineHeight: '1.6', color: colorPalette.mediumGrayText }}>Si no encuentras lo que buscas en nuestras preguntas frecuentes o necesitas asistencia adicional, no dudes en contactarnos. Estamos listos para ayudarte con cualquier inquietud.</p>
            <ul style={{ listStyleType: 'none', padding: '0' }}>
                <li style={{ marginBottom: '10px' }}>
                    <strong style={{ color: colorPalette.darkGrayText }}>Email:</strong>
                    <a href="mailto:soporte@flookypets.com" style={{ color: colorPalette.darkBlueText, textDecoration: 'none' }}>soporte@flookypets.com</a>
                </li>
                <li style={{ marginBottom: '10px' }}>
                    <strong style={{ color: colorPalette.darkGrayText }}>Teléfono:</strong>
                    <span style={{ color: colorPalette.mediumGrayText }}> +57 (601) 123-4567 (Disponible de L-V, 9 AM - 5 PM)</span>
                </li>
                <li style={{ marginBottom: '10px' }}>
                    <strong style={{ color: colorPalette.darkGrayText }}>Chat en vivo:</strong>
                    <span style={{ color: colorPalette.mediumGrayText }}> Disponible en horario de oficina (próximamente, para una ayuda aún más rápida)</span>
                </li>
            </ul>

            <p style={{ marginTop: '30px', textAlign: 'center', color: '#777' }}>Agradecemos tu paciencia y confianza en Flooky Pets. ¡Estamos aquí para hacer tu experiencia lo más sencilla posible!</p>
        </div>
    );
};

function App() {
    // Inicializa el estado del usuario intentando recuperarlo del localStorage
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');
            if (storedUser && storedToken) {
                const parsedUser = JSON.parse(storedUser);
                return { ...parsedUser, token: storedToken };
            }
        } catch (error) {
            console.error("Error al recuperar usuario del localStorage:", error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        return null;
    });

    // --- ESTA ES LA MODIFICACIÓN PARA EL TÍTULO DE LA PESTAÑA ---
    useEffect(() => {
        document.title = "Flooky Pets"; // Esto cambiará el título de la pestaña del navegador a "Flooky Pets"
    }, []); // El array vacío [] asegura que esto se ejecute solo una vez al montar el componente App

    // Efecto para sincronizar el estado 'user' con localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', user.token);
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, [user]);

    // EFECTO PARA MOSTRAR LA ADVERTENCIA DE LA CONSOLA SOLO EN PRODUCCIÓN
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            import('./utils/consoleWarning.js').then(({ showConsoleWarning }) => {
                showConsoleWarning();
            }).catch(err => {
                if (window._originalConsoleError) {
                    window._originalConsoleError("Error al cargar la advertencia de la consola:", err);
                } else {
                    console.error("Error al cargar la advertencia de la consola:", err);
                }
            });
        }
    }, []);

    return (
        <Router>
            <NotificationProvider>
                <NotificationDisplay />

                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/olvide-contraseña" element={<ForgotPassword />} />
                    <Route path="/register" element={<Registro />} />

                    {/* Rutas para Administrador */}
                    <Route element={<Protegida user={user} setUser={setUser} allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminDashboard user={user} setUser={setUser} />}>
                            <Route index element={<AdminStats user={user} />} />
                            <Route path="dashboard" element={<AdminStats user={user} />} />
                            <Route path="services" element={<ServicesManagement user={user} />} />
                            <Route path="veterinarians" element={<VetsManagement user={user} />} />
                            <Route path="administrators" element={<AdminsManagement user={user} />} />
                            <Route path="users" element={<AdminUserManagement user={user} />} />
                            <Route path="appointments" element={<AdminAppointments user={user} />} />
                            <Route path="medical-records" element={<AdminMedicalRecords user={user} />} />
                            <Route path="settings" element={<AdminSettings user={user} />} />
                            <Route path="profile" element={<UserProfile user={user} setUser={setUser} />} />
                        </Route>
                    </Route>

                    {/* Rutas para Veterinario */}
                    <Route element={<Protegida user={user} setUser={setUser} allowedRoles={['veterinario', 'admin']} />}>
                        <Route path="/veterinario" element={<MainVeterinario user={user} setUser={setUser} />}>
                            <Route index element={<NavegacionVeterinario />} />
                            <Route path="navegacion" element={<NavegacionVeterinario />} />
                            <Route path="propietarios" element={<ListaPropietarios />} />
                            <Route path="propietarios/registrar" element={<RegistrarPropietario />} />
                            <Route path="propietarios/:id" element={<DetallePropietario />} />
                            <Route path="propietarios/editar/:id" element={<EditarPropietario />} />
                            <Route path="mascotas" element={<ListaMascotasVeterinario />} />
                            <Route path="mascotas/:id" element={<DetalleMascotaVeterinario />} />
                            <Route path="mascotas/registrar" element={<RegistrarMascotaVeterinario />} />
                            <Route path="mascotas/editar/:id" element={<EditarMascotaVeterinario />} />
                            <Route path="citas" element={<ListaCitasVeterinario />} />
                            <Route path="citas/agendar" element={<CrearCitaVeterinario />} />
                            <Route path="citas/:id" element={<DetalleCitaVeterinario />} />
                            <Route path="historiales" element={<ListaHistorialesVeterinario />} />
                            <Route path="historiales/:idHistorial" element={<DetalleHistorialVeterinario />} />
                            <Route path="historiales/registrar" element={<RegistrarHistorialMedico />} />
                            <Route path="historiales/editar/:id" element={<EditarHistorialMedico />} />
                            <Route path="perfil" element={<VerPerfilVeterinario setUser={setUser} />} />
                            <Route path="perfil/editar" element={<EditarPerfilVeterinario />} />
                            <Route path="configuracion" element={<ConfiguracionVeterinario />} />
                        </Route>
                    </Route>

                    {/* Rutas para Usuario */}
                    <Route element={<Protegida user={user} setUser={setUser} allowedRoles={['usuario']} />}>
                        <Route path="/usuario" element={<InicioUsuario user={user} setUser={setUser} />}>
                            <Route index element={<HomeDashboard />} />
                            <Route path="mascotas" element={<ListaMascotasUsuario user={user} />} />
                            <Route path="mascotas/:id" element={<DetalleMascota user={user} />} />
                            <Route path="mascotas/editar/:id" element={<EditarMascota user={user} />} />
                            <Route path="citas" element={<CitasUsuario user={user} />} />
                            <Route path="citas/agendar" element={<AgendarCita user={user} />} />
                            <Route path="citas/:id" element={<DetalleCita user={user} />} />
                            <Route path="servicios" element={<ServiciosVeterinaria user={user} />} />
                            <Route path="servicios/:id" element={<DetalleServicio user={user} />} />
                            <Route path="perfil" element={<PerfilUsuario user={user} setUser={setUser} />} />
                            <Route path="perfil/editar" element={<EditarPerfil user={user} setUser={setUser} />} />
                            <Route path="perfil/configuracion" element={<ConfiguracionPerfil user={user} setUser={setUser} />} />
                            <Route path="historial/:mascotaId" element={<HistorialMedico user={user} />} />
                            <Route path="historial/:mascotaId/:historialId" element={<DetalleHistorial user={user} />} />
                            <Route path="ayuda" element={<Ayuda />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </NotificationProvider>
        </Router>
    );
}

export default App;