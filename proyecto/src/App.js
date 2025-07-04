// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Main from "./Pages/Inicio/Main";
import Login from "./Pages/Login/Login.js";
import Registro from "./Pages/Login/Registro.js";
import ForgotPassword from "./Pages/Login/OlvideContraseña.js";

// Componentes de Usuario
import InicioUsuario from "./Pages/InicioUsuario/InicioUsuario.js"; // Ahora es un layout
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
import EditarPerfil from "./Pages/InicioUsuario/EditarPerfil.js"; // Se corrigió la ruta si es necesario
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
import AdminUserManagement from "./Pages/InicioAdministrador/AdminUserManagement"; // Asegúrate de que la ruta sea correcta
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


function App() {
    // Inicializa el estado del usuario intentando recuperarlo del localStorage
    // Esto es crucial para mantener la sesión si el usuario recarga la página
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token'); // También recupera el token
            if (storedUser && storedToken) {
                const parsedUser = JSON.parse(storedUser);
                // Asegúrate de que el objeto user siempre tenga el token
                return { ...parsedUser, token: storedToken };
            }
        } catch (error) {
            console.error("Error al recuperar usuario del localStorage en App.js:", error);
            // Si hay un error al parsear, limpia el localStorage para evitar datos corruptos
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        return null;
    });

    // Efecto para sincronizar el estado 'user' con localStorage
    // Cada vez que el estado 'user' cambia, se actualiza el localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', user.token); // Asegúrate de guardar el token
        } else {
            // Si el usuario es null (sesión cerrada), limpia el localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }, [user]); // Se ejecuta cada vez que el objeto 'user' cambia

    // handleLogout ya no es necesario pasarlo a Login o a los layouts principales
    // ya que Protegida ahora maneja el cierre de sesión y setUser se encarga de limpiar el localStorage.
    // Si necesitas un botón de "Cerrar Sesión" en tus layouts, simplemente llama a setUser(null) desde allí.

    return (
        <Router>
            {/* Envuelve toda la aplicación con el proveedor de notificaciones */}
            <NotificationProvider>
                {/* Componente para mostrar las notificaciones globalmente */}
                <NotificationDisplay />

                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Main />} />
                    {/* Login ahora solo necesita setUser */}
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/olvide-contraseña" element={<ForgotPassword />} />
                    <Route path="/register" element={<Registro />} />

                    {/* Rutas de administrador */}
                    {/* Pasa user y setUser a Protegida */}
                    <Route element={<Protegida user={user} setUser={setUser} allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminDashboard user={user} setUser={setUser} />}>
                            <Route index element={<AdminStats user={user} />} />
                            <Route path="dashboard" element={<AdminStats user={user} />} />
                            <Route path="services" element={<ServicesManagement user={user} />} />
                            <Route path="veterinarians" element={<VetsManagement user={user} />} />
                            <Route path="administrators" element={<AdminsManagement user={user} />} />
                            <Route path="users" element={<AdminUserManagement user={user} />} />
                            <Route path="appointments" element={<AdminAppointments user={user} />} />
                            {/* AdminMedicalRecords ya no necesita handleLogout como prop directa */}
                            <Route path="medical-records" element={<AdminMedicalRecords user={user} />} />
                            <Route path="settings" element={<AdminSettings user={user} />} />
                            <Route path="profile" element={<UserProfile user={user} setUser={setUser} />} />
                        </Route>
                    </Route>

                    {/* Rutas de veterinario */}
                    {/* Pasa user y setUser a Protegida. Los administradores también pueden acceder aquí. */}
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
                            <Route path="historiales/registrar" element={<RegistrarHistorialMedico />} />
                            <Route path="historiales/:id" element={<DetalleHistorialVeterinario />} />
                            <Route path="historiales/editar/:id" element={<EditarHistorialMedico />} />
                            <Route path="perfil" element={<VerPerfilVeterinario setUser={setUser} />} />
                            <Route path="perfil/editar" element={<EditarPerfilVeterinario />} />
                            <Route path="configuracion" element={<ConfiguracionVeterinario />} />
                        </Route>
                    </Route>

                    {/* Rutas de usuario (InicioUsuario como layout principal) */}
                    {/* Pasa user y setUser a Protegida */}
                    <Route element={<Protegida user={user} setUser={setUser} allowedRoles={['usuario']} />}>
                        <Route path="/usuario" element={<InicioUsuario user={user} setUser={setUser} />}>
                            {/* Rutas anidadas que se renderizarán dentro del <Outlet /> de InicioUsuario */}
                            <Route index element={<HomeDashboard />} />

                            {/* Rutas de Mascotas */}
                            <Route path="mascotas" element={<ListaMascotasUsuario user={user} />} />
                            <Route path="mascotas/:id" element={<DetalleMascota user={user} />} />
                            <Route path="mascotas/editar/:id" element={<EditarMascota user={user} />} />

                            {/* Rutas de Citas */}
                            <Route path="citas" element={<CitasUsuario user={user} />} />
                            <Route path="citas/agendar" element={<AgendarCita user={user} />} />
                            <Route path="citas/:id" element={<DetalleCita user={user} />} />

                            {/* Rutas de Servicios */}
                            <Route path="servicios" element={<ServiciosVeterinaria user={user} />} />
                            <Route path="servicios/:id" element={<DetalleServicio user={user} />} />

                            {/* Rutas de Perfil y Historial Médico - ANIDADAS DENTRO DE /usuario para usar el mismo layout */}
                            <Route path="perfil" element={<PerfilUsuario user={user} setUser={setUser} />} />
                            <Route path="perfil/editar" element={<EditarPerfil user={user} setUser={setUser} />} />
                            <Route path="perfil/configuracion" element={<ConfiguracionPerfil user={user} setUser={setUser} />} />
                            <Route path="historial/:mascotaId" element={<HistorialMedico user={user} />} />
                            <Route path="historial/:mascotaId/:historialId" element={<DetalleHistorial user={user} />} />

                        </Route>
                    </Route>

                    {/* Ruta de fallback: redirige cualquier ruta no definida a la página principal */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </NotificationProvider>
        </Router>
    );
}

export default App;
