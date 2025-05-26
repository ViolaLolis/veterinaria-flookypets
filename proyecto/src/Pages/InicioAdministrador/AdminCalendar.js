import React, { useState } from 'react'; // <--- ADDED useState here
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Styles/AdminCalendar.css';

const localizer = momentLocalizer(moment);

const AdminCalendar = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Reunión con veterinarios',
      start: new Date(2023, 10, 15, 10, 0),
      end: new Date(2023, 10, 15, 11, 0),
    },
    // Más eventos...
  ]);

  return (
    <div className="calendar-container">
      <h2>Calendario Administrativo</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default AdminCalendar;