import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Styles/ConfiguracionPerfil.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCog,faUserEdit,faEnvelope,faLock,faCheckCircle,faCamera,faExclamationTriangle,faArrowLeft,faPhone,faMapMarkerAlt,faBell,faShieldAlt} from '@fortawesome/free-solid-svg-icons';

const ConfiguracionPerfil = () => {
  const [nombre, setNombre] = useState('Usuario Ejemplo'); // Estado para el nombre
  const [email, setEmail] = useState('ejemplo@email.com'); // Estado para el email
  const [password, setPassword] = useState(''); // Estado para la contraseña (no se recomienda almacenar la real en el frontend)
  const [imagenPerfil, setImagenPerfil] = useState(null); // Estado para la imagen de perfil
  const [mensaje, setMensaje] = useState(''); // Estado para mensajes de éxito/error
  const navigate = useNavigate();

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleImagenPerfilChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImagenPerfil(URL.createObjectURL(e.target.files[0])); // Previsualización de la imagen
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos al servidor para guardar los cambios
    console.log('Guardando cambios:', { nombre, email, password, imagenPerfil });
    setMensaje('¡Perfil actualizado con éxito!');
    setTimeout(() => setMensaje(''), 3000); // Limpiar mensaje después de 3 segundos
  };

  const handleVolver = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faCog} className={styles.icon} />
        <h3>Configuración del Perfil</h3>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.volverIcon} /> Volver
        </button>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileImageContainer}>
          <img
            src={imagenPerfil || 'https://via.placeholder.com/150'} // Imagen por defecto
            alt="Imagen de perfil"
            className={styles.profileImage}
          />
          <label htmlFor="uploadImagen" className={styles.uploadLabel}>
            <FontAwesomeIcon icon={faCamera} />
            <input
              type="file"
              id="uploadImagen"
              accept="image/*"
              onChange={handleImagenPerfilChange}
              className={styles.uploadInput}
            />
          </label>
        </div>
        <p className={styles.profileName}>{nombre}</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="nombre" className={styles.formLabel}>
            <FontAwesomeIcon icon={faUserEdit} className={styles.inputIcon} />
            Nombre:
          </label>
          <input
            type="text"
            id="nombre"
            placeholder="Tu nombre"
            className={styles.formInput}
            value={nombre}
            onChange={handleNombreChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
            Correo Electrónico:
          </label>
          <input
            type="email"
            id="email"
            placeholder="tu@email.com"
            className={styles.formInput}
            value={email}
            onChange={handleEmailChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.formLabel}>
            <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
            Contraseña:
          </label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            className={styles.formInput}
            value={password}
            onChange={handlePasswordChange}
          />
          <Link
            to="/usuario/perfil/cambiar-contrasena"
            className={styles.changePasswordLink}
          >
            Cambiar Contraseña
          </Link>
        </div>

        {/* Puedes añadir más campos de configuración aquí, por ejemplo: */}
        <div className={styles.formGroup}>
          <label htmlFor="telefono" className={styles.formLabel}>
            <FontAwesomeIcon icon={faPhone} className={styles.inputIcon} />
            Teléfono:
          </label>
          <input
            type="tel"
            id="telefono"
            placeholder="Tu número de teléfono"
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="direccion" className={styles.formLabel}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
            Dirección:
          </label>
          <input
            type="text"
            id="direccion"
            placeholder="Tu dirección"
            className={styles.formInput}
          />
        </div>

        <button type="submit" className={styles.guardarBtn} disabled={!nombre || !email}>
          <FontAwesomeIcon icon={faCheckCircle} className={styles.guardarIcon} />
          Guardar Cambios
        </button>

        {mensaje && (
          <div className={mensaje.includes('éxito') ? styles.mensajeExito : styles.mensajeError}>
            {mensaje}
          </div>
        )}
      </form>

      <div className={styles.accionesAdicionales}>
        <Link to="/usuario/perfil/notificaciones" className={styles.accionLink}>
          <FontAwesomeIcon icon={faBell} className={styles.accionIcon} />
          Configuración de Notificaciones
        </Link>
        <Link to="/usuario/perfil/privacidad" className={styles.accionLink}>
          <FontAwesomeIcon icon={faShieldAlt} className={styles.accionIcon} />
          Privacidad y Seguridad
        </Link>
        <button className={styles.accionBtnDanger}>
          <FontAwesomeIcon icon={faExclamationTriangle} className={styles.accionIconDanger} />
          Eliminar Cuenta
        </button>
      </div>
    </div>
  );
};

export default ConfiguracionPerfil;
