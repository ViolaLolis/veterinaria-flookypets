import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Styles/MetodosPago.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faPlusCircle, faCreditCard, faTrashAlt, faEdit, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faPaypal as faPaypalBrand, faApplePay, faGooglePay } from '@fortawesome/free-brands-svg-icons'; // Importa más iconos de marca

const MetodosPago = () => {
  const [metodos, setMetodos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulación de carga de métodos de pago desde una API o almacenamiento local
    const storedMetodos = localStorage.getItem('metodosPago');
    if (storedMetodos) {
      setMetodos(JSON.parse(storedMetodos));
    } else {
      // Datos de ejemplo iniciales si no hay nada almacenado
      setMetodos([
        { id: 1, tipo: 'Tarjeta de Crédito', numero: '****-****-****-1234', marca: 'visa' },
        { id: 2, tipo: 'PayPal', cuenta: 'usuario@paypal.com' },
        { id: 3, tipo: 'Tarjeta de Crédito', numero: '****-****-****-5678', marca: 'mastercard' },
        { id: 4, tipo: 'Apple Pay', cuenta: 'Cuenta de Apple Pay' },
        { id: 5, tipo: 'Google Pay', cuenta: 'Cuenta de Google Pay' },
      ]);
    }
  }, []);

  useEffect(() => {
    // Simulación de guardado de métodos de pago en el almacenamiento local
    localStorage.setItem('metodosPago', JSON.stringify(metodos));
  }, [metodos]);

  const getIcon = (tipo, marca) => {
    switch (tipo) {
      case 'Tarjeta de Crédito':
        if (marca === 'visa') {
          return <FontAwesomeIcon icon={faCreditCard} className={`${styles.metodoIcon} ${styles.visa}`} />;
        } else if (marca === 'mastercard') {
          return <FontAwesomeIcon icon={faCreditCard} className={`${styles.metodoIcon} ${styles.mastercard}`} />;
        } else {
          return <FontAwesomeIcon icon={faCreditCard} className={styles.metodoIcon} />;
        }
      case 'PayPal':
        return <FontAwesomeIcon icon={faPaypalBrand} className={`${styles.metodoIcon} ${styles.paypal}`} />;
      case 'Apple Pay':
        return <FontAwesomeIcon icon={faApplePay} className={`${styles.metodoIcon} ${styles.applepay}`} />;
      case 'Google Pay':
        return <FontAwesomeIcon icon={faGooglePay} className={`${styles.metodoIcon} ${styles.googlepay}`} />;
      default:
        return <FontAwesomeIcon icon={faWallet} className={styles.metodoIcon} />;
    }
  };

  const handleEliminarMetodo = (id) => {
    const nuevosMetodos = metodos.filter(metodo => metodo.id !== id);
    setMetodos(nuevosMetodos);
  };

  const handleEditarMetodo = (id) => {
    // Redirigir a la página de edición del método de pago
    navigate(`/usuario/perfil/pagos/editar/${id}`);
  };

  const handleVolver = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faWallet} className={styles.icon} />
        <h3>Mis Métodos de Pago</h3>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.volverIcon} /> Volver
        </button>
      </div>
      {metodos.length > 0 ? (
        <ul className={styles.listaMetodos}>
          {metodos.map(metodo => (
            <li key={metodo.id} className={styles.metodo}>
              <div className={styles.metodoInfo}>
                {getIcon(metodo.tipo, metodo.marca)}
                <div className={styles.detalles}>
                  <span className={styles.metodoTipo}>{metodo.tipo}:</span>
                  <span className={styles.metodoDetalle}>{metodo.numero || metodo.cuenta}</span>
                </div>
              </div>
              <div className={styles.acciones}>
                <button className={styles.editarBtn} onClick={() => handleEditarMetodo(metodo.id)} aria-label={`Editar ${metodo.tipo}`}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button className={styles.eliminarBtn} onClick={() => handleEliminarMetodo(metodo.id)} aria-label={`Eliminar ${metodo.tipo}`}>
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.noMetodos}>
          <p>No tienes métodos de pago agregados.</p>
          <FontAwesomeIcon icon={faWallet} className={styles.noMetodosIcon} />
          <p>¡Agrega uno ahora!</p>
        </div>
      )}
      <Link to="/usuario/perfil/pagos/agregar" className={styles.agregarBtn}>
        <FontAwesomeIcon icon={faPlusCircle} className={styles.plusIcon} />
        Agregar Nuevo Método de Pago
      </Link>
    </div>
  );
};

export default MetodosPago;