import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "../Styles/CalendarView.css";

function CalendarView({ appointments, pets, services }) {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  // Horarios disponibles
  const availableHours = [
    '9:00 AM', '10:00 AM', '11:00 AM', 
    '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  // Formatear fecha para comparación
  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Citas para el día seleccionado
  const dailyAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    return formatDate(appDate) === formatDate(date);
  });

  // Verificar si un horario está ocupado
  const isTimeSlotBooked = (time) => {
    return dailyAppointments.some(app => app.time === time);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleScheduleAppointment = () => {
    if (!selectedTime) return;
    
    navigate('/nueva-cita', {
      state: {
        selectedDate: date,
        selectedTime,
        pets,
        services
      }
    });
  };

  return (
    <div className="calendar-view-container">
      <h1>Calendario de Citas</h1>
      
      <div className="calendar-container">
        <div className="calendar-wrapper">
          <Calendar
            onChange={handleDateChange}
            value={date}
            minDate={new Date()}
            locale="es"
          />
        </div>
        
        <div className="time-slots-container">
          <h2>Horarios disponibles para {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
          
          <div className="time-slots-grid">
            {availableHours.map(time => (
              <button
                key={time}
                className={`time-slot ${selectedTime === time ? 'selected' : ''} ${isTimeSlotBooked(time) ? 'booked' : ''}`}
                onClick={() => !isTimeSlotBooked(time) && handleTimeSelect(time)}
                disabled={isTimeSlotBooked(time)}
              >
                {time}
                {isTimeSlotBooked(time) && <span className="booked-label">Ocupado</span>}
              </button>
            ))}
          </div>
          
          {selectedTime && (
            <button 
              className="schedule-button"
              onClick={handleScheduleAppointment}
            >
              Agendar cita a las {selectedTime}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;