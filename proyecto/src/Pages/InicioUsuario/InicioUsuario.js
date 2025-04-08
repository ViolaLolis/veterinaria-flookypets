import React from 'react';
import MisMascotas from './MisMascotas';
import CitasUsuario from './CitasUsuario';
import ServiciosVeterinaria from './ServiciosVeterinaria';
import BarraNavegacionUsuario from './BarraNavegacionUsuario';
import styles from './Styles/InicioUsuario.module.css';
import logo from '../Inicio/Imagenes/flooty.png';

const InicioUsuario = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={logo} alt="Logo Flooky Pets" className={styles.logo} />
        <h2 className={styles.welcome}>Bienvenido a Flooky Pets</h2>
      </div>
      <div className={styles.content}>
        <MisMascotas />
        <CitasUsuario />
        <ServiciosVeterinaria />
      </div>
      <BarraNavegacionUsuario />
    </div>
  );
};

export default InicioUsuario;