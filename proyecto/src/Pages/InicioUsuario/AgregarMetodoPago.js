import React from 'react';
import styles from './Styles/AgregarMetodoPago.module.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const AgregarMetodoPago = () => {
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Agregar Método de Pago</h3>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.volverIcon} /> Volver
        </button>
      </div>
      <form className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="tipo">Tipo de Pago:</label>
          <select id="tipo">
            <option value="credito">Tarjeta de Crédito</option>
            <option value="debito">Tarjeta de Débito</option>
            <option value="paypal">PayPal</option>
            <option value="applepay">Apple Pay</option>
            <option value="googlepay">Google Pay</option>
            <option value="transferencia">Transferencia Bancaria</option>
          </select>
        </div>

        {/* Campos específicos para cada tipo de pago */}
        <div className={`${styles.formGroup} ${styles.tarjeta}`} id="tarjetaInfo">
          <label htmlFor="numeroTarjeta">Número de Tarjeta:</label>
          <input type="text" id="numeroTarjeta" placeholder="****-****-****-****" />
          <label htmlFor="fechaExpiracion">Fecha de Expiración:</label>
          <input type="text" id="fechaExpiracion" placeholder="MM/AA" />
          <label htmlFor="cvv">CVV:</label>
          <input type="text" id="cvv" placeholder="***" />
        </div>

        <div className={`${styles.formGroup} ${styles.paypal}`} id="paypalInfo">
          <label htmlFor="cuentaPaypal">Cuenta de PayPal:</label>
          <input type="email" id="cuentaPaypal" placeholder="tu@email.com" />
        </div>

        <div className={`${styles.formGroup} ${styles.applepay}`} id="applepayInfo">
          <p>Por favor, confirma el pago con Apple Pay en tu dispositivo.</p>
          {/* Aquí podrías añadir un botón o indicación visual */}
        </div>

        <div className={`${styles.formGroup} ${styles.googlepay}`} id="googlepayInfo">
          <p>Por favor, confirma el pago con Google Pay en tu dispositivo.</p>
          {/* Aquí podrías añadir un botón o indicación visual */}
        </div>

        <div className={`${styles.formGroup} ${styles.transferencia}`} id="transferenciaInfo">
          <label htmlFor="banco">Banco:</label>
          <input type="text" id="banco" placeholder="Nombre del Banco" />
          <label htmlFor="cuentaBancaria">Número de Cuenta:</label>
          <input type="text" id="cuentaBancaria" placeholder="Número de Cuenta" />
          <p className={styles.notaTransferencia}>Por favor, realiza la transferencia y adjunta el comprobante.</p>
          <label htmlFor="comprobante">Adjuntar Comprobante:</label>
          <input type="file" id="comprobante" />
        </div>

        <button type="submit" className={styles.agregarBtn}>Agregar Método de Pago</button>
      </form>
    </div>
  );
};

export default AgregarMetodoPago;