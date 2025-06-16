import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Styles/ConfiguracionPerfil.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCog,faUserEdit,faEnvelope,faLock,faCheckCircle,faCamera,faExclamationTriangle,faArrowLeft,faPhone,faMapMarkerAlt,faBell,faShieldAlt,faChevronDown,faChevronUp} from '@fortawesome/free-solid-svg-icons';

const ConfiguracionPerfil = () => {
  const [nombre, setNombre] = useState('Usuario Ejemplo');
  const [email, setEmail] = useState('ejemplo@email.com');
  const [password, setPassword] = useState('');
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [activeSection, setActiveSection] = useState('informacion');
  const [showSubMenu, setShowSubMenu] = useState(false);
  const navigate = useNavigate();

  const handleNombreChange = (e) => setNombre(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const handleImagenPerfilChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImagenPerfil(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Guardando cambios:', { nombre, email, password, imagenPerfil });
    setMensaje('¡Perfil actualizado con éxito!');
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleVolver = () => navigate(-1);

  const toggleSubMenu = () => setShowSubMenu(!showSubMenu);

  return (
    <div className={styles.container}>
      {/* Header con efecto de gradiente */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FontAwesomeIcon icon={faCog} className={styles.icon} spin />
          <h3>Editar Perfil</h3>
          <button onClick={handleVolver} className={styles.volverBtn}>
            <FontAwesomeIcon icon={faArrowLeft} /> Volver
          </button>
        </div>
      </div>

      <div className={styles.mainLayout}>
        {/* Panel lateral con menú interactivo */}
        <div className={styles.sidePanel}>
          <div 
            className={styles.profileCard}
            onClick={toggleSubMenu}
          >
            <div className={styles.profileImageContainer}>
              <img
                src={imagenPerfil || 'https://via.placeholder.com/150'}
                alt="Perfil"
                className={styles.profileImage}
              />
              <div className={styles.profileOverlay}>
                <FontAwesomeIcon icon={faCamera} />
              </div>
              <input
                type="file"
                id="uploadImagen"
                accept="image/*"
                onChange={handleImagenPerfilChange}
                className={styles.uploadInput}
              />
            </div>
            <p className={styles.profileName}>{nombre}</p>
            <FontAwesomeIcon 
              icon={showSubMenu ? faChevronUp : faChevronDown} 
              className={styles.chevronIcon}
            />
          </div>
          {/* Contenido adicional del panel lateral */}
          <div className={styles.sidePanelContent}>
            <h4>Estadísticas</h4>
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>24</span>
                <span className={styles.statLabel}>Actividades</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>89%</span>
                <span className={styles.statLabel}>Perfil completo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className={styles.mainContent}>
          {activeSection === 'informacion' && (
            <form className={styles.form} onSubmit={handleSubmit}>
              <h4 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faUserEdit} /> Información Personal
              </h4>
              
              <div className={styles.formGrid}>
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
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.guardarBtn} disabled={!nombre || !email}>
                  <FontAwesomeIcon icon={faCheckCircle} /> Guardar Cambios
                </button>
              </div>

              {mensaje && (
                <div className={mensaje.includes('éxito') ? styles.mensajeExito : styles.mensajeError}>
                  {mensaje}
                </div>
              )}
            </form>
          )}

          {activeSection === 'seguridad' && (
            <div className={styles.sectionContent}>
              <h4 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faShieldAlt} /> Seguridad
              </h4>
              
              <div className={styles.securityCard}>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>
                    <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                    Contraseña Actual:
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    className={styles.formInput}
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className={styles.securityActions}>
                  <Link to="/usuario/perfil/cambiar-contrasena" className={styles.securityBtn}>
                    <FontAwesomeIcon icon={faLock} /> Cambiar Contraseña
                  </Link>
                  <button className={styles.securityBtnDanger}>
                    <FontAwesomeIcon icon={faExclamationTriangle} /> Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notificaciones' && (
            <div className={styles.sectionContent}>
              <h4 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faBell} /> Configuración de Notificaciones
              </h4>
              
              <div className={styles.notificationSettings}>
                <div className={styles.notificationItem}>
                  <div className={styles.notificationInfo}>
                    <h5>Notificaciones por Email</h5>
                    <p>Recibe actualizaciones importantes por correo electrónico</p>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notificationItem}>
                  <div className={styles.notificationInfo}>
                    <h5>Notificaciones Push</h5>
                    <p>Recibe alertas en tu dispositivo</p>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.notificationItem}>
                  <div className={styles.notificationInfo}>
                    <h5>Recordatorios</h5>
                    <p>Notificaciones para actividades pendientes</p>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'preferencias' && (
            <div className={styles.sectionContent}>
              <h4 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faCog} /> Preferencias
              </h4>
              
              <div className={styles.preferencesGrid}>
                <div className={styles.preferenceItem}>
                  <h5>Tema de la aplicación</h5>
                  <div className={styles.themeOptions}>
                    <button className={`${styles.themeBtn} ${styles.themeLight}`}>Claro</button>
                    <button className={`${styles.themeBtn} ${styles.themeDark}`}>Oscuro</button>
                    <button className={`${styles.themeBtn} ${styles.themeSystem}`}>Sistema</button>
                  </div>
                </div>

                <div className={styles.preferenceItem}>
                  <h5>Idioma</h5>
                  <select className={styles.selectInput}>
                    <option>Español</option>
                    <option>English</option>
                    <option>Français</option>
                  </select>
                </div>

                <div className={styles.preferenceItem}>
                  <h5>Privacidad</h5>
                  <div className={styles.privacyOptions}>
                    <label className={styles.radioOption}>
                      <input type="radio" name="privacy" defaultChecked />
                      <span className={styles.radioLabel}>Perfil público</span>
                    </label>
                    <label className={styles.radioOption}>
                      <input type="radio" name="privacy" />
                      <span className={styles.radioLabel}>Perfil privado</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionPerfil;