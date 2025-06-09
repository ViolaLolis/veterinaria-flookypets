import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './Styles/AgendarCita.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaw, faUser, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const AgendarCita = () => {
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [citaAgendada, setCitaAgendada] = useState(false);
  const [errorSeleccion, setErrorSeleccion] = useState('');
  const [mascotas, setMascotas] = useState([]);
  const [selectedMascota, setSelectedMascota] = useState('');
  const [veterinarios, setVeterinarios] = useState([]);
  const [selectedVeterinario, setSelectedVeterinario] = useState('');
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const horariosDisponibles = [
    '09:00', '10:00', '11:00', '15:00', '16:00', '17:00'
  ];

  // Obtener datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el ID del servicio desde la navegación
        const servicioId = location.state?.servicioId;
        
        if (servicioId) {
          const [servicioRes, mascotasRes, veterinariosRes] = await Promise.all([
            axios.get(`/api/servicios/${servicioId}`),
            axios.get('/api/mascotas'), // Asumiendo que el endpoint devuelve las mascotas del usuario logueado
            axios.get('/api/veterinarios')
          ]);
          
          setServicio(servicioRes.data);
          setMascotas(mascotasRes.data);
          setVeterinarios(veterinariosRes.data);
        }
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [location.state]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setCitaAgendada(false);
    setErrorSeleccion('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setErrorSeleccion('');
  };

  const handleSubmit = async () => {
    if (!selectedMascota || !selectedTime) {
      setErrorSeleccion('Por favor, completa todos los campos.');
      return;
    }

    try {
      // Combinar fecha y hora
      const fechaHora = new Date(date);
      const [hours, minutes] = selectedTime.split(':');
      fechaHora.setHours(parseInt(hours, 10));
      fechaHora.setMinutes(parseInt(minutes, 10));
      
      // Crear objeto de cita según tu estructura de base de datos
      const nuevaCita = {
        id_cliente: 1, // Esto debería venir del usuario logueado
        id_servicio: servicio.id_servicio,
        id_veterinario: selectedVeterinario || null,
        id_mascota: selectedMascota,
        fecha: fechaHora.toISOString(),
        ubicacion: 'Clínica Veterinaria Principal', // Puedes hacer esto configurable
        estado: 'pendiente'
      };

      // Enviar la cita al servidor
      await axios.post('/api/citas', nuevaCita);
      
      setCitaAgendada(true);
      // Limpiar el formulario después de 3 segundos
      setTimeout(() => {
        navigate('/mis-citas'); // Redirigir a la lista de citas
      }, 3000);
    } catch (err) {
      setErrorSeleccion('Error al agendar la cita. Por favor, intenta nuevamente.');
      console.error(err);
    }
  };

  const handleVolver = () => {
    navigate(-1);
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>
          <FontAwesomeIcon icon={faPaw} /> Agendar Cita Médica
        </h3>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.volverIcon} /> Volver
        </button>
      </div>

      {servicio && (
        <div className={styles.servicioInfo}>
          <h4>
            <FontAwesomeIcon icon={faInfoCircle} /> Servicio seleccionado:
          </h4>
          <p><strong>{servicio.nombre}</strong> - {servicio.descripcion}</p>
          <p>Precio: {servicio.precio}</p>
        </div>
      )}

      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label>
            <FontAwesomeIcon icon={faPaw} /> Selecciona tu mascota:
          </label>
          <select
            value={selectedMascota}
            onChange={(e) => setSelectedMascota(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">-- Selecciona una mascota --</option>
            {mascotas.map(mascota => (
              <option key={mascota.id_mascota} value={mascota.id_mascota}>
                {mascota.nombre} ({mascota.especie}, {mascota.edad} años)
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>
            <FontAwesomeIcon icon={faUser} /> Veterinario preferido (opcional):
          </label>
          <select
            value={selectedVeterinario}
            onChange={(e) => setSelectedVeterinario(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">-- Sin preferencia --</option>
            {veterinarios.map(vet => (
              <option key={vet.id} value={vet.id}>
                Dr. {vet.nombre} {vet.apellido}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.calendarSection}>
        <div className={styles.calendarContainer}>
          <h4>Selecciona una fecha:</h4>
          <Calendar
            onChange={handleDateChange}
            value={date}
            minDate={new Date()}
            locale="es-ES"
          />
        </div>

        <div className={styles.horariosContainer}>
          <h4>Horarios Disponibles</h4>
          <ul className={styles.horariosLista}>
            {horariosDisponibles.map(time => (
              <li key={time} className={selectedTime === time ? styles.selected : ''}>
                <button onClick={() => handleTimeSelect(time)}>{time}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {errorSeleccion && <p className={styles.errorMessage}>{errorSeleccion}</p>}
      {citaAgendada && (
        <div className={styles.successMessage}>
          ¡Cita agendada con éxito! Redirigiendo...
        </div>
      )}

      <div className={styles.actions}>
        <button 
          onClick={handleSubmit} 
          disabled={!selectedMascota || !selectedTime || citaAgendada}
          className={styles.agendarBtn}
        >
          Confirmar Cita
        </button>
      </div>
    </div>
  );
};

export default AgendarCita;