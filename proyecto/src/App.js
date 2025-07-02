import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Main from "./Pages/Inicio/Main";
import Login from "./Pages/Login/Login.js";
import Registro from "./Pages/Login/Registro.js";
import ForgotPassword from "./Pages/Login/OlvideContraseña.js";

// Componentes de Usuario
import InicioUsuario from "./Pages/InicioUsuario/InicioUsuario.js"; // Ahora es un layout
import HomeDashboard from "./Pages/InicioUsuario/InicioDashboard.js"; // <--- NUEVA IMPORTACIÓN
import CitasUsuario from "./Pages/InicioUsuario/CitasUsuario.js";
import ServiciosVeterinaria from "./Pages/InicioUsuario/ServiciosVeterinaria.js";
import PerfilUsuario from "./Pages/InicioUsuario/PerfilUsuario.js";
import AyudaSoporte from "./Pages/InicioUsuario/AyudaSoporte.js";
import ConfiguracionPerfil from "./Pages/InicioUsuario/ConfiguracionPerfil.js";
import HistorialMedico from "./Pages/InicioUsuario/HistorialMedico.js";
import AgendarCita from "./Pages/InicioUsuario/AgendarCita.js";
import DetalleMascota from "./Pages/InicioUsuario/DetalleMascota.js";
import AgregarMascota from "./Pages/InicioUsuario/AgregarMascota.js";
import EditarMascota from "./Pages/InicioUsuario/EditarMascota.js";
import DetalleCita from "./Pages/InicioUsuario/DetalleCita.js";
import EditarPerfil from "./Pages/InicioUsuario/EditarPerfil.js";
import DetalleServicio from "./Pages/InicioUsuario/DetalleServicio.js";
import ChatSoporte from "./Pages/InicioUsuario/ChatSoporte.js";
import EditarCita from "./Pages/InicioUsuario/EditarCita.js";
import DetalleHistorial from "./Pages/InicioUsuario/DetalleHistorial.js";
import ListaMascotasUsuario from "./Pages/InicioUsuario/ListaMascotasUsuario.js";

// Componentes de Veterinario
import ListaPropietarios from "./Pages/InicioVeterinario/ListaPropietarios";
import DetallePropietario from "./Pages/InicioVeterinario/DetallePropietario";
import RegistrarPropietario from "./Pages/InicioVeterinario/RegistrarPropietario";
import EditarPropietario from "./Pages/InicioVeterinario/EditarPropietario";
import ListaMascotasVeterinario from "./Pages/InicioVeterinario/ListaMascotas"; // Asegúrate de que el nombre del archivo sea ListaMascotas.js
import DetalleMascotaVeterinario from "./Pages/InicioVeterinario/DetalleMascota"; // Asegúrate de que el nombre del archivo sea DetalleMascota.js
import RegistrarMascotaVeterinario from "./Pages/InicioVeterinario/RegistrarMascota"; // Asegúrate de que el nombre del archivo sea RegistrarMascota.js
import EditarMascotaVeterinario from "./Pages/InicioVeterinario/EditarMascota"; // Asegúrate de que el nombre del archivo sea EditarMascota.js
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
import RegistrarHistorialMedico from "./Pages/InicioVeterinario/RegistrarHistorialMedico"; // Importar nuevo componente
import EditarHistorialMedico from "./Pages/InicioVeterinario/EditarHistorialMedico"; // Importar nuevo componente


// Componentes de Administrador
import AdminDashboard from "./Pages/InicioAdministrador/AdminDashboard";
import AdminStats from "./Pages/InicioAdministrador/AdminStats";
import AdminUsers from "./Pages/InicioAdministrador/AdminUsers";
import AdminUserDetail from "./Pages/InicioAdministrador/AdminUserDetail";
import AdminAppointments from "./Pages/InicioAdministrador/AdminAppointments";
import AdminMedicalRecords from "./Pages/InicioAdministrador/AdminMedicalRecords";
import AdminSettings from "./Pages/InicioAdministrador/AdminSettings";
import ServicesManagement from "./Pages/InicioAdministrador/ServicesManagement";
import VetsManagement from "./Pages/InicioAdministrador/VetsManagement";
import AdminsManagement from "./Pages/InicioAdministrador/AdminsManagement";
import UserProfile from "./Pages/InicioAdministrador/UserProfile";

// Componente para proteger rutas
import { Protegida } from "./Seguridad/Protegidos.js";

function App() {
  const [user, setUser] = React.useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/olvide-contraseña" element={<ForgotPassword />} />
        <Route path="/register" element={<Registro />} />

        {/* Rutas de administrador */}
        <Route element={<Protegida user={user} allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard user={user} setUser={setUser} />}>
            <Route index element={<AdminStats user={user} />} />
            <Route path="dashboard" element={<AdminStats user={user} />} />
            <Route path="services" element={<ServicesManagement user={user} />} />
            <Route path="veterinarians" element={<VetsManagement user={user} />} />
            <Route path="administrators" element={<AdminsManagement user={user} />} />
            <Route path="users" element={<AdminUsers user={user} />} />
            <Route path="users/:userId" element={<AdminUserDetail user={user} />} />
            <Route path="appointments" element={<AdminAppointments user={user} />} />
            <Route path="medical-records" element={<AdminMedicalRecords user={user} />} />
            <Route path="settings" element={<AdminSettings user={user} />} />
            <Route path="profile" element={<UserProfile user={user} setUser={setUser} />} />
          </Route>
        </Route>

        {/* Rutas de veterinario */}
        <Route element={<Protegida user={user} allowedRoles={['veterinario', 'admin']} />}>
          {/* MainVeterinario ahora recibe user y setUser */}
          <Route path="/veterinario" element={<MainVeterinario user={user} setUser={setUser} />}>
            <Route index element={<NavegacionVeterinario />} />
            <Route path="navegacion" element={<NavegacionVeterinario />} />
            <Route path="propietarios" element={<ListaPropietarios />} />
            <Route path="propietarios/registrar" element={<RegistrarPropietario />} />
            <Route path="propietarios/:id" element={<DetallePropietario />} />
            <Route path="propietarios/editar/:id" element={<EditarPropietario />} /> {/* NUEVA RUTA */}
            <Route path="mascotas" element={<ListaMascotasVeterinario />} />
            <Route path="mascotas/:id" element={<DetalleMascotaVeterinario />} />
            <Route path="mascotas/registrar" element={<RegistrarMascotaVeterinario />} />
            <Route path="mascotas/editar/:id" element={<EditarMascotaVeterinario />} />
            <Route path="citas" element={<ListaCitasVeterinario />} />
            <Route path="citas/agendar" element={<CrearCitaVeterinario />} />
            <Route path="citas/:id" element={<DetalleCitaVeterinario />} />
            <Route path="historiales" element={<ListaHistorialesVeterinario />} />
            <Route path="historiales/registrar" element={<RegistrarHistorialMedico />} /> {/* Nueva ruta */}
            <Route path="historiales/:id" element={<DetalleHistorialVeterinario />} />
            <Route path="historiales/editar/:id" element={<EditarHistorialMedico />} /> {/* Nueva ruta */}
            <Route path="perfil" element={<VerPerfilVeterinario setUser={setUser} />} />
            <Route path="perfil/editar" element={<EditarPerfilVeterinario />} />
            <Route path="configuracion" element={<ConfiguracionVeterinario />} />
          </Route>
        </Route>

        {/* Rutas de usuario (InicioUsuario como layout principal) */}
        <Route element={<Protegida user={user} allowedRoles={['usuario']} />}>
          <Route path="/usuario" element={<InicioUsuario user={user} setUser={setUser} />}>
            {/* Rutas anidadas que se renderizarán dentro del <Outlet /> de InicioUsuario */}
            {/* La ruta index ahora renderiza el HomeDashboard */}
            <Route index element={<HomeDashboard />} /> {/* <--- CAMBIO CLAVE AQUÍ */}

            {/* Rutas de Mascotas */}
            <Route path="mascotas" element={<ListaMascotasUsuario user={user} />} />
            <Route path="mascotas/agregar" element={<AgregarMascota user={user} />} />
            <Route path="mascotas/:id" element={<DetalleMascota user={user} />} />
            <Route path="mascotas/editar/:id" element={<EditarMascota user={user} />} />

            {/* Rutas de Citas */}
            <Route path="citas" element={<CitasUsuario user={user} />} />
            <Route path="citas/agendar" element={<AgendarCita user={user} />} />
            <Route path="citas/:id" element={<DetalleCita user={user} />} />
            <Route path="citas/editar/:id" element={<EditarCita user={user} />} />

            {/* Rutas de Servicios */}
            <Route path="servicios" element={<ServiciosVeterinaria user={user} />} />
            <Route path="servicios/:id" element={<DetalleServicio user={user} />} />

            {/* Rutas de Perfil, Ayuda y Historial - ANIDADAS DENTRO DE /usuario para usar el mismo layout */}
            {/* NOTA: He movido estas rutas dentro de la ruta /usuario para que compartan el layout de InicioUsuario */}
            <Route path="perfil" element={<PerfilUsuario user={user} setUser={setUser} />} />
            <Route path="perfil/editar" element={<EditarPerfil user={user} setUser={setUser} />} />
            <Route path="perfil/configuracion" element={<ConfiguracionPerfil user={user} setUser={setUser} />} />
            <Route path="ayuda" element={<AyudaSoporte />} />
            <Route path="ayuda/chat" element={<ChatSoporte />} />
            <Route path="historial/:mascotaId" element={<HistorialMedico user={user} />} />
            <Route path="historial/:mascotaId/:historialId" element={<DetalleHistorial user={user} />} />

            {/* Rutas de Perfil (ahora como rutas directas, ya que no se anidan en el Outlet de InicioUsuario) */}
            {/* NOTA: Estas rutas están fuera del <Route path="/usuario" element={<InicioUsuario />}> */}
            {/* Si quieres que PerfilUsuario, ConfiguracionPerfil, etc. tengan el mismo layout que InicioUsuario,
                deberías anidarlas aquí, pero necesitarías que InicioUsuario gestione el renderizado de esas secciones
                internamente o que sean componentes que se rendericen en el Outlet.
                Por la estructura actual de tu App.js, las mantendré como rutas hermanas de /usuario.
                Si quieres que tengan el mismo layout, tendrías que moverlas DENTRO de la ruta /usuario
                y hacer que InicioUsuario las muestre en su Outlet, o que InicioUsuario sea un layout
                más general que englobe todas las rutas de usuario.
            */}
            <Route path="/usuario/perfil" element={<PerfilUsuario user={user} setUser={setUser} />} />
            <Route path="/usuario/perfil/editar" element={<EditarPerfil user={user} setUser={setUser} />} />
            <Route path="/usuario/perfil/configuracion" element={<ConfiguracionPerfil user={user} setUser={setUser} />} />
            <Route path="/usuario/ayuda" element={<AyudaSoporte />} />
            <Route path="/usuario/ayuda/chat" element={<ChatSoporte />} />
            <Route path="/usuario/historial/:mascotaId" element={<HistorialMedico user={user} />} />
            <Route path="/usuario/historial/:mascotaId/:historialId" element={<DetalleHistorial user={user} />} />

            {/* Rutas para agregar/editar historial (sugeridas, si tienes los componentes) */}
            {/* <Route path="historial/:mascotaId/agregar" element={<AgregarHistorialMedico user={user} />} /> */}
            {/* <Route path="historial/:mascotaId/editar/:historialId" element={<EditarHistorialMedico user={user} />} /> */}

          </Route>
        </Route>

        {/* Ruta de fallback */}
        <Route path="*" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;