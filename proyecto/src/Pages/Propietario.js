import React, { useState, useEffect } from 'react';
import '../Styles/Propietario.css';
import { Link } from 'react-router-dom';
import catImage from '../Imagenes/flooty.png';

function Propietario() {
  const [catImages, setCatImages] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);

  useEffect(() => {
    fetch('https://api.thecatapi.com/v1/images/search?limit=10')
      .then((response) => response.json())
      .then((data) => setCatImages(data));
  },);

  const handleCatClick = (cat) => {
    setSelectedCat(cat);
  };

  return (
    <div className="propietario-container">
      <header className="header">
        <nav className="navbar">
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/login">Logout</Link>
            </li>
          </ul>
        </nav>
      </header>
      <div className="content-wrapper">
        <div className="sidebar">
          <img src={catImage} alt="Profile" className="profile-image" />
          <button className="sidebar-button">Ver Historial Médico</button>
          <button className="sidebar-button">Ver Mascota</button>
          <button className="sidebar-button">Ver Citas Agendadas</button>
        </div>
        <div className="content">
          <div className="cat-images">
            {catImages &&
              catImages.map((cat) => (
                <img key={cat.id} src={cat.url} alt="Cat" className="cat-image" onClick={() => handleCatClick(cat)}/>
              ))}
          </div>
          {selectedCat && (
            <div className="cat-info">
              <p>ID: {selectedCat.id}</p>
              <p>Width: {selectedCat.width}</p>
              <p>Height: {selectedCat.height}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Propietario;