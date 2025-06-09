import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Styles/AgendarCita.module.css';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Importa el icono de volver

const AgendarCita = () => {
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [citaAgendada, setCitaAgendada] = useState(false);
  const [errorSeleccion, setErrorSeleccion] = useState('');
  const navigate = useNavigate(); // Inicializa useNavigate

  const horariosVeterinaria = [
    '09:00', '10:00', '11:00', '15:00', '16:00', '17:00'
  ];

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setCitaAgendada(false); // Resetear mensaje al cambiar la fecha
    setErrorSeleccion('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setErrorSeleccion('');
  };

  const handleSubmit = () => {
    if (selectedTime) {
      const formattedDate = date.toLocaleDateString();
      // Aquí iría la lógica real para enviar la cita al servidor
      console.log(`Cita agendada para el ${formattedDate} a las ${selectedTime}`);
      setCitaAgendada(true);
    } else {
      setErrorSeleccion('Por favor, selecciona un horario.');
    }
  };

  const handleVolver = () => {
    navigate(-1); // Vuelve a la página anterior en el historial
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Agendar Cita Médica</h3>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.volverIcon} /> Volver
        </button>
      </div>
      <div className={styles.calendarContainer}>
        <Calendar
          onChange={handleDateChange}
          value={date}
        />
      </div>
      <div className={styles.horariosContainer}>
        <h4>Horarios Disponibles</h4>
        <ul className={styles.horariosLista}>
          {horariosVeterinaria.map(time => (
            <li key={time} className={selectedTime === time ? styles.selected : ''}>
              <button onClick={() => handleTimeSelect(time)}>{time}</button>
            </li>
          ))}
        </ul>
      </div>
      {errorSeleccion && <p className={styles.error}>{errorSeleccion}</p>}
      {citaAgendada && <p className={styles.exito}>¡Cita agendada con éxito!</p>}
      <button onClick={handleSubmit} disabled={!selectedTime} className={styles.agendarBtn}>
        Agendar Cita
      </button>
    </div>
  );
};

export default AgendarCita;