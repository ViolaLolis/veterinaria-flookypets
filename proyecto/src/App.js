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
import AgendarCita from "./Pages/InicioUsuario/AgendarCita.js"; // Importa AgendarCita
import { Protegida } from "./Seguridad/Protegidos.js";

function App() {
  const [user, setUser] = React.useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/olvide-contraseña" element={<ForgotPassword />} />
        <Route path="/register" element={<Registro />} />

        {/* Rutas protegidas para admin */}
        <Route element={<Protegida user={user} allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Rutas protegidas para veterinario */}
        <Route element={<Protegida user={user} allowedRoles={['veterinario', 'admin']} />}>
          <Route path="/veterinario" element={<Veterinario />} />
        </Route>

        {/* Rutas protegidas para usuario */}
        <Route path="/usuario" element={<Protegida user={user} allowedRoles={['usuario', 'admin', 'veterinario']} />}>
          <Route path="" element={<InicioUsuario />} /> {/* Ruta base de usuario */}
          <Route path="mascotas" element={<MisMascotas />} />
          <Route path="citas" element={<CitasUsuario />} />
          <Route path="citas/agendar" element={<AgendarCita />} />
          <Route path="servicios" element={<ServiciosVeterinaria />} />
          <Route path="perfil" element={<PerfilUsuario />} />
          <Route path="ayuda" element={<AyudaSoporte />} />
          <Route path="perfil/configuracion" element={<ConfiguracionPerfil />} />
          <Route path="perfil/pagos" element={<MetodosPago />} />
          <Route path="perfil/pagos/agregar" element={<AgregarMetodoPago />} />
          <Route path="mascota/:id/historial" element={<HistorialMedico />} />
          {/* Agrega aquí las demás rutas anidadas */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;