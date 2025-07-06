// src/Components/Notifications/NotificationDisplay.js
import React from 'react';
import { useNotifications } from './NotificationContext';
import NotificationBox from './NotificationBox'; // Importa el nuevo componente de caja de notificación
import { AnimatePresence, motion } from 'framer-motion'; // Importa para animaciones

const NotificationDisplay = () => {
    const { notifications, removeNotification, markNotificationAsRead } = useNotifications();

    // Define la posición global para todas las notificaciones
    // Puedes hacer que esta posición sea configurable si lo deseas (ej. desde props de App.js)
    const globalPosition = 'top-right'; // O 'top-left'

    // Marcar como leída automáticamente después de un tiempo o al hacer clic
    const handleNotificationClick = (notifId, isDbNotification) => {
        // Si la notificación es efímera (no tiene id_notificacion de la BD), no la marcamos como leída en el backend
        if (notifId && isDbNotification) { // Solo si el ID es válido Y es una notificación de BD
            markNotificationAsRead(notifId, isDbNotification);
        }
        // Opcional: puedes redirigir al usuario a la página de la cita/historial si notif.referencia_id existe
        // const navigate = useNavigate();
        // if (notif.referencia_id && notif.tipo.includes('cita')) {
        //   navigate(`/usuario/citas/${notif.referencia_id}`);
        // }
    };

    return (
        // El contenedor principal que define la posición y el espaciado entre notificaciones
        // Utiliza las clases de posicionamiento y espaciado definidas en NotificationBox.css
        <div className={`notification-container ${globalPosition}`}>
            <AnimatePresence>
                {notifications.map((notif) => (
                    // Solo muestra notificaciones no leídas
                    !notif.leida && (
                        <motion.div
                            key={notif.id_notificacion || notif.id} // Usa el ID de la BD o el ID temporal
                            // Las animaciones de entrada y salida se definen aquí con framer-motion
                            initial={globalPosition === 'top-right' ? { opacity: 0, x: '100%' } : { opacity: 0, x: '-100%' }}
                            animate={{ opacity: 1, x: '0%' }}
                            exit={globalPosition === 'top-right' ? { opacity: 0, x: '100%' } : { opacity: 0, x: '-100%' }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            layout // Para animar los cambios de posición de las notificaciones cuando se añaden/eliminan
                        >
                            <NotificationBox
                                id={notif.id_notificacion || notif.id} // Pasa el ID al componente de la caja
                                type={notif.tipo} // Pasa el 'tipo' de la notificación para que NotificationBox aplique el estilo correcto
                                message={notif.mensaje} // Pasa el 'mensaje' de la notificación
                                // No pasamos 'duration' a NotificationBox para auto-cerrado,
                                // ya que NotificationContext ya maneja la lógica de temporización para eliminar del estado.
                                // NotificationBox solo se encarga de la animación de salida cuando es removido del DOM por AnimatePresence.
                                position={globalPosition} // Pasa la posición para que NotificationBox aplique la animación correcta (aunque ya no se usa para CSS animaciones)
                                // CORREGIDO: Pasa isDbNotification para que removeNotification sepa si debe llamar al backend
                                onClose={() => removeNotification(notif.id_notificacion || notif.id, !!notif.id_notificacion)}
                            />
                        </motion.div>
                    )
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDisplay;