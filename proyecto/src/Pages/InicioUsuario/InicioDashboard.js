import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPaw, FaCalendarAlt, FaShoppingBag, FaUser, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import './Styles/InicioDashboard.css';

// Componente para las tarjetas individuales del dashboard
const DashboardCard = ({ icon: Icon, title, description, ctaText, onClick, delay }) => {
 const cardVariants = {
   hidden: { opacity: 0, y: 50 },
   visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } }
 };

 return (
   <motion.div
     className="inicioDash-card"
     variants={cardVariants}
     initial="hidden"
     animate="visible"
     whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
     whileTap={{ scale: 0.98 }}
     onClick={onClick}
   >
     <Icon className="inicioDash-cardIcon" />
     <h3 className="inicioDash-cardTitle">{title}</h3>
     <p className="inicioDash-cardDescription">{description}</p>
     <span className="inicioDash-callToAction">{ctaText} &rarr;</span>
   </motion.div>
 );
};

const InicioDashboard = () => {
 const { user, showNotification } = useOutletContext();
 const navigate = useNavigate();

 const [numMascotas, setNumMascotas] = useState(0);
 const [proximaCita, setProximaCita] = useState(null);
 const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

 useEffect(() => {
   const fetchDashboardData = async () => {
     if (user) {
       // Simulate a delay for data fetching
       setTimeout(() => {
         const petsCount = user.mascotas ? user.mascotas.length : 0;
         setNumMascotas(petsCount);

         // Mock data for the next appointment
         const mockCita = {
           date: "2025-07-15", // Make sure this date is realistic
           time: "10:00 AM",
           description: "Revisión anual",
           id: "cita123"
         };
         setProximaCita(mockCita);
         setIsLoadingDashboard(false); // Data loaded
       }, 500); // Simulate network delay
     } else {
       // If user data is not yet available, keep loading state
       setIsLoadingDashboard(true);
     }
   };

   fetchDashboardData();
 }, [user]); // Depend on 'user' to re-run when user data is loaded

 const handleNavigateToPets = () => {
   if (numMascotas === 0) {
     showNotification('No tienes mascotas registradas. ¡Añade una ahora!', 'info');
   }
   navigate('/usuario/mascotas');
 };

 const handleNavigateToAppointments = () => {
   if (!proximaCita) {
     showNotification('No tienes citas próximas. ¡Agenda una ahora!', 'info');
   }
   navigate('/usuario/citas');
 };

 // Display a loading state if user data hasn't arrived yet
 if (!user || isLoadingDashboard) {
   return (
     <div className="inicioDash-loading">
       <FaSpinner className="inicioDash-spinner" />
       <p>Cargando tu dashboard...</p>
     </div>
   );
 }

 return (
   <motion.div
     className="inicioDash-container"
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     transition={{ duration: 0.7 }}
   >
     <div className="inicioDash-welcomeSection">
       <h2 className="inicioDash-welcomeTitle">
         ¡Bienvenido, <span className="inicioDash-userName">{user?.nombre?.split(' ')[0] || 'Propietario'}</span>!
       </h2>
       <p className="inicioDash-welcomeText">
         Tu portal dedicado para gestionar el bienestar de tus adorables compañeros.
       </p>
       <p className="inicioDash-roleIndicator">
         Bienvenido, propietario. En nuestra clínica, su mascota es parte de nuestra familia.
         Esperamos que disfruten juntos de una vida larga y saludable.
       </p>
     </div>

     {/* Sección de Información/Consejo */}
     <motion.div
       className="inicioDash-infoSection"
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.2, duration: 0.6 }}
     >
       <span className="infoContainer">
         <FaInfoCircle className="inicioDash-infoIcon" />
         <strong>Consejo:</strong>
       </span>
       Para aprovechar al máximo tu experiencia, te recomendamos verificar y completar la información de tus compañeros peludos en la sección "Mis Mascotas".
     </motion.div>

     {/* Quick Summary / Statistics Section */}
     <motion.div
       className="inicioDash-summarySection"
       initial={{ opacity: 0, y: 30 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.4, duration: 0.6 }}
     >
       <div className="summary-item" onClick={handleNavigateToPets}>
         <FaPaw className="summary-icon" />
         <p className="summary-text">Tienes <strong>{numMascotas}</strong> mascotas registradas.</p>
         <button className="summary-action-button">
           Ver Detalles
         </button>
       </div>
       <div className="summary-item" onClick={handleNavigateToAppointments}>
         <FaCalendarAlt className="summary-icon" />
         <p className="summary-text">
           Próxima cita: <strong>{proximaCita ? `${proximaCita.date} ${proximaCita.time}` : 'No hay citas próximas'}</strong>
         </p>
         <button className="summary-action-button" disabled={!proximaCita}>
           Ver Detalles
         </button>
       </div>
     </motion.div>

     <hr className="inicioDash-divider" />

     <div className="inicioDash-cardsGrid">
       <DashboardCard
         icon={FaPaw}
         title="Mis Mascotas"
         description="Gestiona la información, registros de salud y perfiles de tus compañeros peludos."
         ctaText="Explorar"
         onClick={() => navigate('/usuario/mascotas')}
         delay={0.6}
       />

       <DashboardCard
         icon={FaCalendarAlt}
         title="Mis Citas"
         description="Agenda, revisa y gestiona tus próximas citas veterinarias. Mantente al día."
         ctaText="Agendar"
         onClick={() => navigate('/usuario/citas')}
         delay={0.8}
       />

       <DashboardCard
         icon={FaShoppingBag}
         title="Nuestros Servicios"
         description="Descubre todos los servicios de veterinaria y productos disponibles para tus mascotas."
         ctaText="Ver más"
         onClick={() => navigate('/usuario/servicios')}
         delay={1.0}
       />

       <DashboardCard
         icon={FaUser}
         title="Mi Perfil"
         description="Actualiza tus datos personales y gestiona las configuraciones de tu cuenta."
         ctaText="Editar"
         onClick={() => navigate('/usuario/perfil')}
         delay={1.2}
       />
     </div>
   </motion.div>
 );
};

export default InicioDashboard;