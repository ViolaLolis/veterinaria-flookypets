// src/Components/Notifications/NotificationDisplay.js
import React, { useEffect } from 'react';
import { useNotifications } from './NotificationContext';

const NotificationDisplay = () => {
  const { notifications, removeNotification, markNotificationAsRead, userRole } = useNotifications();

  // Función para obtener los estilos de la notificación según su tipo
  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
      case 'cita_aceptada_user':
        return 'bg-green-500 text-white';
      case 'error':
      case 'cita_rechazada_user':
        return 'bg-red-500 text-white';
      case 'warning':
      case 'cita_creada_vet': // Advertencia para el veterinario de nueva cita
      case 'cita_registrada_user': // Info para el usuario de cita pendiente
        return 'bg-yellow-500 text-gray-800';
      case 'info':
      case 'cita_creada_admin_vet':
      case 'cita_cancelada_user':
      case 'cita_cancelada_vet':
      case 'cita_cancelada_admin':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  // Función para obtener el mensaje formateado
  const getFormattedMessage = (notif) => {
    // Aquí puedes añadir lógica para formatear mensajes basados en 'tipo' y 'referencia_id'
    // Por ejemplo, si 'referencia_id' es el ID de una cita, podrías generar un enlace.
    // Por ahora, usaremos el mensaje tal cual de la BD.
    return notif.mensaje;
  };

  // Marcar como leída automáticamente después de un tiempo o al hacer clic
  const handleNotificationClick = (notifId) => {
    // Si la notificación es efímera (no tiene id_notificacion de la BD), no la marcamos como leída en el backend
    if (notifId) { // Solo si el ID es válido (no undefined/null)
      markNotificationAsRead(notifId);
    }
    // Opcional: puedes redirigir al usuario a la página de la cita/historial si notif.referencia_id existe
    // const navigate = useNavigate();
    // if (notif.referencia_id && notif.tipo.includes('cita')) {
    //   navigate(`/usuario/citas/${notif.referencia_id}`);
    // }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notif) => (
        // Solo muestra notificaciones no leídas
        !notif.leida && (
          <div
            // *** CORRECCIÓN DE LA ADVERTENCIA "key" ***
            // Usa id_notificacion si existe (para notificaciones de la BD), de lo contrario usa id (para notificaciones efímeras)
            key={notif.id_notificacion || notif.id} 
            className={`p-4 rounded-lg shadow-lg flex items-center justify-between cursor-pointer animate-fade-in-down ${getNotificationStyles(notif.tipo)}`}
            role="alert"
            // *** CORRECCIÓN PARA EL CLICK ***
            // Pasa el ID correcto a la función de manejo de clic
            onClick={() => handleNotificationClick(notif.id_notificacion || notif.id)}
          >
            <p className="text-sm font-medium">{getFormattedMessage(notif)}</p>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Evitar que el clic en el botón cierre la notificación y la marque como leída al mismo tiempo
                // *** CORRECCIÓN PARA ELIMINAR ***
                // Pasa el ID correcto a la función de eliminación
                removeNotification(notif.id_notificacion || notif.id);
              }}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
              aria-label="Cerrar notificación"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      ))}
    </div>
  );
};

export default NotificationDisplay;