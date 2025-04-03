import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Main from "./Pages/Inicio/Main";
import Login from "./Pages/Login/Login.js";
import Admin from "./Pages/Admin/Admin.js";
import Registro from "./Pages/Login/Registro.js";
import ForgotPassword from "./Pages/Login/OlvideContraseña.js";
import UserMenu from "./Pages/Usuarios/Usuario.js";
import Veterinario from "./Pages/Veterinario/Veterinario.js";
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
        </Route>
        
        {/* Rutas protegidas para veterinario */}
        <Route element={<Protegida user={user} allowedRoles={['veterinario', 'admin']} />}>
          <Route path="/veterinario" element={<Veterinario />} />
        </Route>
        
        {/* Rutas protegidas para usuario */}
        <Route element={<Protegida user={user} allowedRoles={['usuario', 'admin', 'veterinario']} />}>
          <Route path="/usuario" element={<UserMenu />} />
        </Route>
        
        <Route path="/register" element={<Registro />} />
      </Routes>
    </Router>
  );
}

export default App;
