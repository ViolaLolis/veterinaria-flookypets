import React from 'react';
import styles from './Styles/HistorialMedico.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStethoscope, faFileMedicalAlt, faPrint, faDownload } from '@fortawesome/free-solid-svg-icons';

const HistorialMedico = () => {
  // Aquí iría la lógica para obtener el historial médico de la mascota seleccionada
  const historial = [
    { id: 1, fecha: '2024-03-10', diagnostico: 'Chequeo general', tratamiento: 'Sin tratamiento', notas: 'Mascota con buen estado de salud general.' },
    { id: 2, fecha: '2024-05-01', diagnostico: 'Vacunación triple felina', tratamiento: 'Vacuna aplicada (lote #XYZ123)', notas: 'Se administró la vacuna sin complicaciones.' },
    { id: 3, fecha: '2024-07-15', diagnostico: 'Infección de oído leve', tratamiento: 'Gotas óticas (dosis: 5 gotas en cada oído, 2 veces al día por 7 días).', notas: 'Se recomienda seguimiento en una semana.' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faFileMedicalAlt} className={styles.icon} />
        <h3>Historial Médico</h3>
      </div>

      {historial.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.historialTable}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Fecha</th>
                <th>Diagnóstico</th>
                <th>Tratamiento</th>
                <th className={styles.notasColumn}>Notas</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {historial.map(item => (
                <tr key={item.id} className={styles.tableRow}>
                  <td>{item.fecha}</td>
                  <td>{item.diagnostico}</td>
                  <td>{item.tratamiento}</td>
                  <td className={styles.notasColumn}>{item.notas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.noHistorial}>
          <FontAwesomeIcon icon={faStethoscope} className={styles.noHistorialIcon} />
          <p>No hay historial médico registrado para esta mascota.</p>
        </div>
      )}

      {/* Posibilidad de agregar funcionalidades como imprimir o descargar el historial */}
      {historial.length > 0 && (
        <div className={styles.actions}>
          <button className={styles.actionButton}>
            <FontAwesomeIcon icon={faPrint} /> Imprimir
          </button>
          <button className={styles.actionButton}>
            <FontAwesomeIcon icon={faDownload} /> Descargar PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default HistorialMedico;