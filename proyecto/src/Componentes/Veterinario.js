import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Veterinario.css';
import vetImage from '../Imagenes/LogoSena.png';

function Veterinario() {
  const [catImages, setCatImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://api.thecatapi.com/v1/images/search?limit=5')
      .then((response) => response.json())
      .then((data) => setCatImages(data));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === catImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 

    return () => clearInterval(interval);
  }, [catImages]);

  const handleLogout = () => {
    navigate('/login');  // Redirige a la página de inicio de sesión
  };

  return (
    <div className="veterinario-container">
      {/* Barra Superior */}
      <header className="vet-header">
        <nav className="vet-navbar">
          <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
        </nav>
      </header>

      {/* Sección de Bienvenida */}
      <section className="vet-welcome">
        <div className="profile-info">
          <img src={vetImage} alt="Foto de perfil" className="profile-pic" />
          <h2>Bienvenido, Veterinario</h2>
        </div>
      </section>

      {/* Menú Lateral */}
      <section className="vet-menu">
        <h3>Opciones</h3>
        <div className="vet-options">
          <Link to="/registrar-mascota" className="vet-button">Registrar Mascota</Link>
          <Link to="/agendar" className="vet-button">Agendar Cita</Link>
          <Link to="/editar-informacion" className="vet-button">Editar Información</Link>
        </div>
      </section>

      {/* Carrusel */}
      {catImages.length > 0 && (
        <div className="carousel-container">
          <img 
            src={catImages[currentImageIndex].url} 
            alt="Gato" 
            className="carousel-image"
          />
        </div>
      )}
    </div>
  );
}

export default Veterinario;



