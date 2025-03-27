import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Main from "./Componentes/Main";
import Login from "./Componentes/Login";
import Admin from "./Componentes/Admin"; 
import RegistrarMascota from "./Componentes/RegistrarMascota";
import Registro from "./Componentes/Registro";
import ForgotPassword from "./Componentes/OlvideContraseña";
import UserMenu from "./Componentes/Usuario";  
import "./Styles/Header.css";
import Veterinario from "./Componentes/Veterinario";
import VerCitas from "./Componentes/VerCitas";
import HistorialMedico from "./Componentes/HistorialMedico";
import VerMascotas from "./Componentes/VerMascotas";
import RegistroVeterinario from './Componentes/RegistrarVeterinario';
import AgendarCita from './Componentes/AgendarCita'; 
import EliminarUsuario from "./Componentes/EliminarUsuario.js";
import EliminarMascota from "./Componentes/EliminarMascota.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/olvide-contraseña" element={<ForgotPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/registrar-mascota" element={<RegistrarMascota />} />
        <Route path="/register" element={<Registro />} />
        <Route path="/usuario" element={<UserMenu />} />
        <Route path="/veterinario" element={<Veterinario />} />
        <Route path="/ver-citas" element={<VerCitas />} />
        <Route path="/historial-medico" element={<HistorialMedico />} />
        <Route path="/ver-mascotas" element={<VerMascotas />} />
        <Route path="/agendar" element={<AgendarCita />} />
        <Route path="/eliminar-usuario" element={<EliminarUsuario />} />
        <Route path="/eliminar-mascotas" element={<EliminarMascota />} />
        <Route path="/registrar-veterinario" element={<RegistroVeterinario/>} />
      </Routes>
    </Router>
  );
}

export default App;

