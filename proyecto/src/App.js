// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Main from "./Pages/Inicio/Main";
import Login from "./Pages/Login/Login.js";
import Admin from "./Pages/Admin/Admin.js";
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
import CrearCita from "./Pages/InicioUsuario/CrearCita.js"; // Nueva ruta
import EditarCita from "./Pages/InicioUsuario/EditarCita.js"; // Nueva ruta
import DetalleHistorial from "./Pages/InicioUsuario/DetalleHistorial.js"; // Nueva ruta
import AgregarHistorial from "./Pages/InicioUsuario/AgregarHistorial.js"; // Nueva ruta
import EditarHistorial from "./Pages/InicioUsuario/EditarHistorial.js"; // Nueva ruta
import EliminarMetodoPago from "./Pages/InicioUsuario/EliminarMetodoPago.js"; // Nueva ruta
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
import ConfiguracionVeterinario from "./Pages/InicioVeterinario/ConfiguracionVeterinario"; // Importa el componente
import LlamadaVeterinario from "./Pages/InicioVeterinario/LlamadaVeterinario"; // Importa el componente

function App() {
  const [user, setUser] = React.useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/olvide-contraseña" element={<ForgotPassword />} />
        <Route path="/register" element={<Registro />} />

        <Route element={<Protegida user={user} allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

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
          <Route path="/veterinario/perfil" element={<VerPerfilVeterinario setUser={setUser} />} /> {/* Pasa setUser como prop */}
          <Route path="/veterinario/perfil/editar" element={<EditarPerfilVeterinario />} />
          <Route path="/veterinario/configuracion" element={<ConfiguracionVeterinario />} /> {/* Nueva ruta */}
          <Route path="/veterinario/llamada" element={<LlamadaVeterinario />} /> {/* Nueva ruta */}
        </Route>

        <Route path="/usuario" element={<Protegida user={user} allowedRoles={['usuario', 'admin', 'veterinario']} />}>
          <Route path="" element={<InicioUsuario />} />
          <Route path="mascotas" element={<MisMascotas />} />
          <Route path="mascotas/agregar" element={<AgregarMascota />} />
          <Route path="mascotas/:id" element={<DetalleMascota />} />
          <Route path="mascotas/editar/:id" element={<EditarMascota />} />
          <Route path="mascota/:mascotaId/historial" element={<HistorialMedico />} />
          <Route path="mascota/:mascotaId/historial/:historialId" element={<DetalleHistorial />} />
          <Route path="mascota/:mascotaId/historial/agregar" element={<AgregarHistorial />} />
          <Route path="mascota/:mascotaId/historial/editar/:historialId" element={<EditarHistorial />} />
          <Route path="citas" element={<CitasUsuario />} />
          <Route path="citas/agendar" element={<AgendarCita />} />
          <Route path="citas/crear" element={<CrearCita />} />
          <Route path="citas/:id" element={<DetalleCita />} />
          <Route path="citas/editar/:id" element={<EditarCita />} />
          <Route path="servicios" element={<ServiciosVeterinaria />} />
          <Route path="servicios/:id" element={<DetalleServicio />} />
          <Route path="perfil" element={<PerfilUsuario />} />
          <Route path="perfil/editar" element={<EditarPerfil />} />
          <Route path="ayuda" element={<AyudaSoporte />} />
          <Route path="ayuda/chat" element={<ChatSoporte />} />
          <Route path="perfil/configuracion" element={<ConfiguracionPerfil />} />
          <Route path="perfil/pagos" element={<MetodosPago />} />
          <Route path="perfil/pagos/agregar" element={<AgregarMetodoPago />} />
          <Route path="perfil/pagos/eliminar/:id" element={<EliminarMetodoPago />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;