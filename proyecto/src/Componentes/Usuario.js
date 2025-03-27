import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/UserMenu.css';

function UserMenu() {
  const navigate = useNavigate();
  const [catImages, setCatImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cargar imágenes de la API de gatos
  useEffect(() => {
    fetch('https://api.thecatapi.com/v1/images/search?limit=5')
      .then((response) => response.json())
      .then((data) => setCatImages(data));
  }, []);

  // Cambiar imagen automáticamente cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === catImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [catImages]);

  return (
    <div className="user-menu-container">
      {/* Barra superior con botón de cerrar sesión */}
      <div className="user-header">
        <button className="logout-button" onClick={() => navigate('./Login.js')}>
          Cerrar Sesión
        </button>
      </div>

      {/* Información del usuario */}
      <div className="user-info">
        <img src="https://via.placeholder.com/150" alt="Usuario" className="profile-picture" />
        <h2>Bienvenido, Juan Pérez</h2>
      </div>

      {/* Opciones de usuario */}
      <div className="user-options">
        <button className="btn-option" onClick={() => navigate('/ver-citas')}>
          Ver citas médicas
        </button>
        <button className="btn-option" onClick={() => navigate('/ver-mascotas')}>
          Ver mascotas registradas
        </button>
        <button className="btn-option" onClick={() => navigate('/historial-medico')}>
          Historial médico
        </button>
      </div>

      {/* Lista de mascotas */}
      <div className="user-pets">
        <h3>Mis Mascotas</h3>
        <div className="pet-list">
          <div className="pet-card">
            <img src="https://via.placeholder.com/100" alt="Firulais" className="pet-image" />
            <p>Firulais</p>
          </div>
          <div className="pet-card">
            <img src="https://via.placeholder.com/100" alt="Michi" className="pet-image" />
            <p>Michi</p>
          </div>
        </div>
      </div>

      {/* Carrusel de imágenes al final */}
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

export default UserMenu;
