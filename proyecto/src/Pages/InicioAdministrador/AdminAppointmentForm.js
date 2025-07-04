// src/Components/Admin/AdminAppointmentForm.js
import React from 'react';
import { useAdminAppointmentFormLogic } from './AdminAppointmentFormLogic';
import AdminAppointmentFormUI from './AdminAppointmentFormUI';

const AdminAppointmentForm = ({ isOpen, onClose, appointment, onSaveSuccess }) => {
    const {
        formData,
        formErrors,
        isSubmitting,
        notification,
        clientes,
        mascotas, // Aunque no se usa directamente en la UI, se pasa para consistencia o si se requiere debug
        servicios,
        veterinarios,
        filteredMascotas,
        handleChange,
        handleBlur,
        handleSubmit,
        getClientDisplay,
        getMascotaDisplay,
        setNotification // Pass it down so UI can clear notification
    } = useAdminAppointmentFormLogic(isOpen, appointment, onSaveSuccess, onClose);

    return (
        <AdminAppointmentFormUI
            isOpen={isOpen}
            onClose={onClose}
            appointment={appointment}
            formData={formData}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
            notification={notification}
            clientes={clientes}
            mascotas={mascotas} // Pass all pets for context, though UI uses filteredMascotas
            servicios={servicios}
            veterinarios={veterinarios}
            filteredMascotas={filteredMascotas}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleSubmit={handleSubmit}
            getClientDisplay={getClientDisplay}
            getMascotaDisplay={getMascotaDisplay}
            setNotification={setNotification}
        />
    );
};

export default AdminAppointmentForm;