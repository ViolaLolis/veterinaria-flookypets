import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Main from "./Pages/Inicio/Main";
import Login from "./Pages/Login/Login.js";
import Registro from "./Pages/Login/Registro.js";
import ForgotPassword from "./Pages/Login/OlvideContraseña.js";
import InicioUsuario from "./Pages/InicioUsuario/InicioUsuario.js";
import MisMascotas from "./Pages/InicioUsuario/MisMascotas.js";
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
import AdminLayout from './Pages/InicioAdministrador/AdminLayout';
import MainAdmin from './Pages/InicioAdministrador/MainAdmin';
import ServicesManagement from './Pages/InicioAdministrador/ServicesManagement';
import StaffManagement from './Pages/InicioAdministrador/StaffManagement';
import Meetings from './Pages/InicioAdministrador/Meetings';
import ProfileSettings from './Pages/InicioAdministrador/ProfileSettings';

function App() {
  const [user, setUser] = React.useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/olvide-contraseña" element={<ForgotPassword />} />
        <Route path="/register" element={<Registro />} />

        {/* Rutas de administrador */}
        <Route element={<Protegida user={user} allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout user={user} setUser={setUser} />}>
            <Route index element={<MainAdmin />} />
            <Route path="servicios" element={<ServicesManagement />} />
            <Route path="personal" element={<StaffManagement />} />
            <Route path="reuniones" element={<Meetings />} />
            <Route path="configuracion" element={<ProfileSettings user={user} setUser={setUser} />} />
          </Route>
        </Route>

        {/* Rutas de veterinario */}
        <Route element={<Protegida user={user} allowedRoles={['veterinario', 'admin']} />}>
          <Route path="/veterinario" element={<MainVeterinario />} />
          <Route path="/veterinario/navegacion" element={<NavegacionVeterinario />} />
          <Route path="/veterinario/propietarios" element={<ListaPropietarios />} />
          <Route path="/veterinario/propietarios/:id" element={<DetallePropietario />} />
          <Route path="/veterinario/propietarios/registrar" element={<RegistrarPropietario />} />
          <Route path="/veterinario/propietarios/editar/:id" element={<EditarPropietario />} />
          <Route path="/veterinario/mascotas" element={<ListaMascotasVeterinario />} />
          <Route path="/veterinario/mascotas/:id" element={<DetalleMascotaVeterinario />} />
          <Route path="/veterinario/mascotas/registrar" element={<RegistrarMascotaVeterinario />} />
          <Route path="/veterinario/mascotas/editar/:id" element={<EditarMascotaVeterinario />} />
          <Route path="/veterinario/citas" element={<ListaCitasVeterinario />} />
          <Route path="/veterinario/citas/:id" element={<DetalleCitaVeterinario />} />
          <Route path="/veterinario/historiales" element={<ListaHistorialesVeterinario />} />
          <Route path="/veterinario/historiales/:id" element={<DetalleHistorialVeterinario />} />
          <Route path="/veterinario/perfil" element={<VerPerfilVeterinario setUser={setUser} />} />
          <Route path="/veterinario/perfil/editar" element={<EditarPerfilVeterinario />} />
          <Route path="/veterinario/configuracion" element={<ConfiguracionVeterinario />} />
          <Route path="/veterinario/llamada" element={<LlamadaVeterinario />} />
        </Route>

        {/* Rutas de usuario */}
        <Route element={<Protegida user={user} allowedRoles={['usuario', 'admin', 'veterinario']} />}>
          <Route path="/usuario" element={<InicioUsuario />} />
          <Route path="/usuario/mascotas" element={<MisMascotas />} />
          <Route path="/usuario/mascotas/agregar" element={<AgregarMascota />} />
          <Route path="/usuario/mascotas/:id" element={<DetalleMascota />} />
          <Route path="/usuario/mascotas/editar/:id" element={<EditarMascota />} />
          <Route path="/usuario/mascota/:mascotaId/historial" element={<HistorialMedico />} />
          <Route path="/usuario/mascota/:mascotaId/historial/:historialId" element={<DetalleHistorial />} />
          <Route path="/usuario/mascota/:mascotaId/historial/agregar" element={<AgregarHistorial />} />
          <Route path="/usuario/mascota/:mascotaId/historial/editar/:historialId" element={<EditarHistorial />} />
          <Route path="/usuario/citas" element={<CitasUsuario />} />
          <Route path="/usuario/citas/agendar" element={<AgendarCita />} />
          <Route path="/usuario/citas/crear" element={<CrearCita />} />
          <Route path="/usuario/citas/:id" element={<DetalleCita />} />
          <Route path="/usuario/citas/editar/:id" element={<EditarCita />} />
          <Route path="/usuario/servicios" element={<ServiciosVeterinaria />} />
          <Route path="/usuario/servicios/:id" element={<DetalleServicio />} />
          <Route path="/usuario/perfil" element={<PerfilUsuario />} />
          <Route path="/usuario/perfil/editar" element={<EditarPerfil />} />
          <Route path="/usuario/ayuda" element={<AyudaSoporte />} />
          <Route path="/usuario/ayuda/chat" element={<ChatSoporte />} />
          <Route path="/usuario/perfil/configuracion" element={<ConfiguracionPerfil />} />
          <Route path="/usuario/perfil/pagos" element={<MetodosPago />} />
          <Route path="/usuario/perfil/pagos/agregar" element={<AgregarMetodoPago />} />
          <Route path="/usuario/perfil/pagos/eliminar/:id" element={<EliminarMetodoPago />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;