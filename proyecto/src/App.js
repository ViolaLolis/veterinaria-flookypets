import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Main from "./Pages/Main.js";
import Login from "./Pages/Login.js";
import Admin from "./Pages/Admin.js"; 
import RegistrarMascota from "./Pages/RegistrarMascota.js";
import Registro from "./Pages/Registro.js";
import ForgotPassword from "./Pages/OlvideContraseña.js";
import UserMenu from "./Pages/Usuario.js";  
import "./Styles/Header.css";
import Veterinario from "./Pages/Veterinario.js";
import VerCitas from "./Pages/VerCitas.js";
import HistorialMedico from "./Pages/HistorialMedico.js";
import VerMascotas from "./Pages/VerMascotas.js";
import RegistroVeterinario from './Pages/RegistrarVeterinario.js';
import AgendarCita from './Pages/AgendarCita.js'; 
import EliminarUsuario from "./Pages/EliminarUsuario.js";
import EliminarMascota from "./Pages/EliminarMascota.js";
import { Protegida } from "./Seguridad/Protegidos.js";

function App() {
  const [user, setUser] = React.useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/olvide-contraseña" element={<ForgotPassword />} />
        
        {/* Rutas protegidas para admin */}
        <Route element={<Protegida user={user} allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/registrar-veterinario" element={<RegistroVeterinario />} />
          <Route path="/eliminar-usuario" element={<EliminarUsuario />} />
          <Route path="/eliminar-mascotas" element={<EliminarMascota />} />
        </Route>
        
        {/* Rutas protegidas para veterinario */}
        <Route element={<Protegida user={user} allowedRoles={['veterinario', 'admin']} />}>
          <Route path="/veterinario" element={<Veterinario />} />
          <Route path="/registrar-mascota" element={<RegistrarMascota />} />
          <Route path="/agendar" element={<AgendarCita />} />
          <Route path="/historial-medico" element={<HistorialMedico />} />
        </Route>
        
        {/* Rutas protegidas para usuario */}
        <Route element={<Protegida user={user} allowedRoles={['usuario', 'admin', 'veterinario']} />}>
          <Route path="/usuario" element={<UserMenu />} />
          <Route path="/ver-citas" element={<VerCitas />} />
          <Route path="/ver-mascotas" element={<VerMascotas />} />
        </Route>
        
        <Route path="/register" element={<Registro />} />
      </Routes>
    </Router>
  );
}

export default App;
