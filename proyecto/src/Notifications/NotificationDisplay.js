// src/Components/Notifications/NotificationDisplay.js
import React from 'react';
import { useNotifications } from './NotificationContext';
import NotificationBox from './NotificationBox'; // Importa el nuevo componente de caja de notificación
import { AnimatePresence, motion } from 'framer-motion'; // Importa para animaciones

const NotificationDisplay = () => {
  const { notifications, removeNotification } = useNotifications();

  // Define la posición global para todas las notificaciones
  // Puedes hacer que esta posición sea configurable si lo deseas (ej. desde props de App.js)
  const globalPosition = 'top-right'; // O 'top-left'

  return (
    // El contenedor principal que define la posición y el espaciado entre notificaciones
    <div className={`notification-container ${globalPosition}`}>
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id_notificacion || notif.id} // Usa el ID de la BD o el ID temporal
            // Las animaciones de entrada y salida se definen en NotificationBox.css
            // AnimatePresence maneja la eliminación del DOM después de la animación de salida
            initial={globalPosition === 'top-right' ? { opacity: 0, x: '100%' } : { opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={globalPosition === 'top-right' ? { opacity: 0, x: '100%' } : { opacity: 0, x: '-100%' }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            layout // Para animar los cambios de posición de las notificaciones cuando se añaden/eliminan
          >
            <NotificationBox
              id={notif.id_notificacion || notif.id} // Pasa el ID al componente de la caja
              type={notif.type}
              message={notif.message}
              // No pasamos 'duration' a NotificationBox para auto-cerrado,
              // ya que NotificationContext ya maneja la lógica de temporización para eliminar del estado.
              // NotificationBox solo se encarga de la animación de salida cuando es removido del DOM por AnimatePresence.
              position={globalPosition} // Pasa la posición para que NotificationBox aplique la animación correcta
              onClose={() => removeNotification(notif.id_notificacion || notif.id)} // Llama a la función del contexto para eliminar
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDisplay;
