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
import Veterinario from "./Pages/Veterinario/Veterinario.js";
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
          <Route path="/veterinario" element={<Veterinario />} />
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