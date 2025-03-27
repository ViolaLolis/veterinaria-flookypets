import './App.css'
import {BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Administrador, Analistica, Datos, Home, Primero } from './paginas/index'
import {useState} from 'react';
import { Protegida } from './componentes/Protegidas';

function App() {
  const [user, setUser] = useState(null)
  const loginAnalista = () => {
    setUser({
      id: 1,
      nombre: 'Juan',
      rol: 'Analista'
    })
  }

  const loginAdministrador = () => {
    setUser({
      id: 2,
      nombre: 'David',
      rol: 'Administrador'
    })
  }

  const loginUsuario = () => {
    setUser({
      id: 3,
      nombre: 'Kevin',
      rol: 'Usuario'
    })
  }
  

  const Logout = () => setUser(null)

  return (
    <div className="App">
      <BrowserRouter>
        <Navigation/>
        {user ? (
          <div className="login-buttons">
            <span>Bienvenido, {user.nombre} ({user.rol})</span>
            <button onClick={Logout}>Logout</button>
          </div>
        ) : (
          <div className="login-buttons">
            <button onClick={loginAnalista}>Login como Analista</button>
            <button onClick={loginAdministrador}>Login como Administrador</button>
            <button onClick={loginUsuario}>Login como Usuario</button>
          </div>
        )}

        <Routes>
        <Route index element={<Primero/>} />
        <Route path='/primero' element={<Primero/>} />
          <Route element={<Protegida user={user} rol='Usuario' />}>
            <Route path='/home' element={<Home/>} />
            <Route path='/datos' element={<Datos/>} />
          </Route>

          <Route element={<Protegida user={user} rol='Administrador' />}>
            <Route path='/administrador' element={<Administrador/>} />
          </Route>
          <Route element={<Protegida user={user} rol='Analista' />}>
            <Route path='/analistica' element={<Analistica/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/primero">Primero</Link></li>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/datos">Datos</Link></li>
        <li><Link to="/analistica">Analistica</Link></li>
        <li><Link to="/administrador">Administrador</Link></li>
      </ul>
    </nav>
  );
}

export default App;