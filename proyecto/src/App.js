import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Main from "./Pages/Inicio/Main";
import Login from "./Pages/Login/Login.js";
import Registro from "./Pages/Login/Registro.js";
import ForgotPassword from "./Pages/Login/OlvideContraseña.js";
import InicioUsuario from "./Pages/InicioUsuario/InicioUsuario.js";
import CitasUsuario from "./Pages/InicioUsuario/CitasUsuario.js";
import ServiciosVeterinaria from "./Pages/InicioUsuario/ServiciosVeterinaria.js";
import PerfilUsuario from "./Pages/InicioUsuario/PerfilUsuario.js";
import AyudaSoporte from "./Pages/InicioUsuario/AyudaSoporte.js";
import ConfiguracionPerfil from "./Pages/InicioUsuario/ConfiguracionPerfil.js";
import MetodosPago from "./Pages/InicioUsuario/MetodosPago.js";
import AgregarMetodoPago from "./Pages/InicioUsuario/AgregarMetodoPago.js";
import HistorialMedico from "./Pages/InicioUsuario/HistorialMedico.js";
import AgendarCita from "./Pages/InicioUsuario/AgendarCita.js";
import DetalleMascota from "./Pages/InicioUsuario/DetalleMascota.js";
import AgregarMascota from "./Pages/InicioUsuario/AgregarMascota.js";
import EditarMascota from "./Pages/InicioUsuario/EditarMascota.js";
import DetalleCita from "./Pages/InicioUsuario/DetalleCita.js";
import EditarPerfil from "./Pages/InicioUsuario/EditarPerfil.js";
import DetalleServicio from "./Pages/InicioUsuario/DetalleServicio.js";
import ChatSoporte from "./Pages/InicioUsuario/ChatSoporte.js";
import { Protegida } from "./Seguridad/Protegidos.js";
import CrearCita from "./Pages/InicioUsuario/CrearCita.js";
import EditarCita from "./Pages/InicioUsuario/EditarCita.js";
import DetalleHistorial from "./Pages/InicioUsuario/DetalleHistorial.js";
import AgregarHistorial from "./Pages/InicioUsuario/AgregarHistorial.js";
import EditarHistorial from "./Pages/InicioUsuario/EditarHistorial.js";
import EliminarMetodoPago from "./Pages/InicioUsuario/EliminarMetodoPago.js";

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
import LlamadaVeterinario from "./Pages/InicioVeterinario/LlamadaVeterinario";

// Componentes de Administrador
import AdminDashboard from "./Pages/InicioAdministrador/AdminDashboard";
import AdminServices from "./Pages/InicioAdministrador/AdminServices";
import AdminVets from "./Pages/InicioAdministrador/AdminVets";
import AdminAdmins from "./Pages/InicioAdministrador/AdminAdmins";
import AdminProfile from "./Pages/InicioAdministrador/AdminProfile";
import AdminStats from "./Pages/InicioAdministrador/AdminStats";
import AdminUsers from "./Pages/InicioAdministrador/AdminUsers";
import AdminAppointments from "./Pages/InicioAdministrador/AdminAppointments";
import AdminMedicalRecords from "./Pages/InicioAdministrador/AdminMedicalRecords";
import AdminSettings from "./Pages/InicioAdministrador/AdminSettings";

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
            <Route index element={<AdminStats />} />
            
            {/* Dashboard y estadísticas */}
            <Route path="dashboard" element={<AdminStats />} />
            
            {/* Gestión de servicios */}
            <Route path="services" element={<AdminServices />} />
            
            {/* Gestión de veterinarios */}
            <Route path="veterinarians" element={<AdminVets />} />
            
            {/* Gestión de administradores */}
            <Route path="administrators" element={<AdminAdmins />} />
            
            {/* Gestión de usuarios */}
            <Route path="users" element={<AdminUsers />} />
            
            {/* Gestión de citas */}
            <Route path="appointments" element={<AdminAppointments />} />
            
            {/* Historiales médicos */}
            <Route path="medical-records" element={<AdminMedicalRecords />} />
            
            {/* Configuración */}
            <Route path="settings" element={<AdminSettings />} />
            
            {/* Perfil */}
            <Route path="profile" element={<AdminProfile user={user} setUser={setUser} />} />
          </Route>
        </Route>

        {/* Rutas de veterinario */}
        <Route element={<Protegida user={user} allowedRoles={['veterinario', 'admin']} />}>
          <Route path="/veterinario" element={<MainVeterinario />}>
            <Route index element={<NavegacionVeterinario />} />
            <Route path="navegacion" element={<NavegacionVeterinario />} />
            
            {/* Gestión de propietarios */}
            <Route path="propietarios" element={<ListaPropietarios />} />
            <Route path="propietarios/:id" element={<DetallePropietario />} />
            <Route path="propietarios/registrar" element={<RegistrarPropietario />} />
            <Route path="propietarios/editar/:id" element={<EditarPropietario />} />
            
            {/* Gestión de mascotas */}
            <Route path="mascotas" element={<ListaMascotasVeterinario />} />
            <Route path="mascotas/:id" element={<DetalleMascotaVeterinario />} />
            <Route path="mascotas/registrar" element={<RegistrarMascotaVeterinario />} />
            <Route path="mascotas/editar/:id" element={<EditarMascotaVeterinario />} />
            
            {/* Gestión de citas */}
            <Route path="citas" element={<ListaCitasVeterinario />} />
            <Route path="citas/:id" element={<DetalleCitaVeterinario />} />
            
            {/* Historiales médicos */}
            <Route path="historiales" element={<ListaHistorialesVeterinario />} />
            <Route path="historiales/:id" element={<DetalleHistorialVeterinario />} />
            
            {/* Perfil y configuración */}
            <Route path="perfil" element={<VerPerfilVeterinario setUser={setUser} />} />
            <Route path="perfil/editar" element={<EditarPerfilVeterinario />} />
            <Route path="configuracion" element={<ConfiguracionVeterinario />} />
            
            {/* Comunicación */}
            <Route path="llamada" element={<LlamadaVeterinario />} />
          </Route>
        </Route>

        {/* Rutas de usuario */}
        <Route element={<Protegida user={user} allowedRoles={['usuario', 'admin', 'veterinario']} />}>
          <Route path="/usuario" element={<InicioUsuario />}>
            <Route index element={<CitasUsuario />} />
            
            {/* Gestión de mascotas */}
            <Route path="mascotas/agregar" element={<AgregarMascota />} />
            <Route path="mascotas/:id" element={<DetalleMascota />} />
            <Route path="mascotas/editar/:id" element={<EditarMascota />} />
            
            {/* Historial médico */}
            <Route path="mascota/:mascotaId/historial" element={<HistorialMedico />} />
            <Route path="mascota/:mascotaId/historial/:historialId" element={<DetalleHistorial />} />
            <Route path="mascota/:mascotaId/historial/agregar" element={<AgregarHistorial />} />
            <Route path="mascota/:mascotaId/historial/editar/:historialId" element={<EditarHistorial />} />
            
            {/* Gestión de citas */}
            <Route path="citas" element={<CitasUsuario />} />
            <Route path="citas/agendar" element={<AgendarCita />} />
            <Route path="citas/crear" element={<CrearCita />} />
            <Route path="citas/:id" element={<DetalleCita />} />
            <Route path="citas/editar/:id" element={<EditarCita />} />
            
            {/* Servicios */}
            <Route path="servicios" element={<ServiciosVeterinaria />} />
            <Route path="servicios/:id" element={<DetalleServicio />} />
            
            {/* Perfil */}
            <Route path="perfil" element={<PerfilUsuario />} />
            <Route path="perfil/editar" element={<EditarPerfil />} />
            
            {/* Ayuda y soporte */}
            <Route path="ayuda" element={<AyudaSoporte />} />
            <Route path="ayuda/chat" element={<ChatSoporte />} />
            
            {/* Configuración */}
            <Route path="perfil/configuracion" element={<ConfiguracionPerfil />} />
            
            {/* Métodos de pago */}
            <Route path="perfil/pagos" element={<MetodosPago />} />
            <Route path="perfil/pagos/agregar" element={<AgregarMetodoPago />} />
            <Route path="perfil/pagos/eliminar/:id" element={<EliminarMetodoPago />} />
          </Route>
        </Route>

        {/* Ruta de fallback para páginas no encontradas */}
        <Route path="*" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;