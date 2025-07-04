// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Main from "./Pages/Inicio/Main";
import Login from "./Pages/Login/Login.js";
import Registro from "./Pages/Login/Registro.js";
import ForgotPassword from "./Pages/Login/OlvideContraseña.js";

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

// NO MÁS LÓGICA DE SUPRESIÓN DE CONSOLE AQUÍ. MUEVE ESTO A index.js (o main.jsx)
// para asegurar que se ejecute antes de que se cargue React y otros componentes.


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
            // Este console.error será suprimido en producción por la lógica en index.js
            console.error("Error al recuperar usuario del localStorage en App.js:", error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        return null;
    });

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
    // Aseguramos que se llame showConsoleWarning solo una vez al montar la aplicación
    // y solo en el entorno de producción.
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            // Importar dinámicamente la función para asegurar que se cargue y ejecute
            // después de que window._originalConsoleLog esté disponible.
            import('./utils/consoleWarning.js').then(({ showConsoleWarning }) => {
                showConsoleWarning();
            }).catch(err => {
                // Este error se imprimiría usando el console.error ya suprimido si no fuera por
                // que es un error de importación, el cual el navegador podría mostrar directamente.
                // Es un caso muy raro, pero es bueno manejarlo.
                // Si llegara aquí, significa que showConsoleWarning.js no se encontró o tuvo un error.
                if (window._originalConsoleError) { // Si el original error fue guardado
                   window._originalConsoleError("Error al cargar la advertencia de la consola:", err);
                } else {
                   // Fallback si no se guardó el original (debería estar ya suprimido de todas formas)
                   console.error("Error al cargar la advertencia de la consola:", err);
                }
            });
        }
    }, []);

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <Router>
            <NotificationProvider>
                <NotificationDisplay />

                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/olvide-contraseña" element={<ForgotPassword />} />
                    <Route path="/register" element={<Registro />} />

                    <Route element={<Protegida user={user} setUser={setUser} allowedRoles={['admin']} handleLogout={handleLogout} />}>
                        <Route path="/admin" element={<AdminDashboard user={user} setUser={setUser} handleLogout={handleLogout} />}>
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

                    <Route element={<Protegida user={user} setUser={setUser} allowedRoles={['veterinario', 'admin']} handleLogout={handleLogout} />}>
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
                            <Route path="historiales/registrar" element={<RegistrarHistorialMedico />} />
                            <Route path="historiales/:id" element={<DetalleHistorialVeterinario />} />
                            <Route path="historiales/editar/:id" element={<EditarHistorialMedico />} />
                            <Route path="perfil" element={<VerPerfilVeterinario setUser={setUser} />} />
                            <Route path="perfil/editar" element={<EditarPerfilVeterinario />} />
                            <Route path="configuracion" element={<ConfiguracionVeterinario />} />
                        </Route>
                    </Route>

                    <Route element={<Protegida user={user} setUser={setUser} allowedRoles={['usuario']} handleLogout={handleLogout} />}>
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
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </NotificationProvider>
        </Router>
    );
}

export default App;