// src/Components/Admin/AdminAppointmentFormUI.js
import React from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import Modal from '../../Components/Modal';
import Notification from '../../Components/Notification';
import './Styles/AdminAppointments.css'; // Keep your styles here

const AdminAppointmentFormUI = ({
    isOpen,
    onClose,
    appointment,
    formData,
    formErrors,
    isSubmitting,
    notification,
    clientes,
    servicios,
    veterinarios,
    filteredMascotas,
    handleChange,
    handleBlur,
    handleSubmit,
    getClientDisplay,
    getMascotaDisplay,
    setNotification // Passed from the logic hook
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={appointment ? "Editar Cita" : "Agendar Nueva Cita"}>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="id_cliente">Cliente:</label>
                        {appointment ? (
                            <input
                                type="text"
                                id="cliente_display"
                                value={getClientDisplay(formData.id_cliente)}
                                className="input-disabled"
                                disabled
                            />
                        ) : (
                            <select
                                id="id_cliente"
                                name="id_cliente"
                                value={formData.id_cliente}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_cliente ? 'input-error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="">Selecciona un cliente</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nombre} {cliente.apellido} ({cliente.email})
                                    </option>
                                ))}
                            </select>
                        )}
                        {formErrors.id_cliente && <span className="error-text">{formErrors.id_cliente}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="id_mascota">Mascota:</label>
                        {appointment ? (
                            <input
                                type="text"
                                id="mascota_display"
                                value={getMascotaDisplay(formData.id_mascota)}
                                className="input-disabled"
                                disabled
                            />
                        ) : (
                            <select
                                id="id_mascota"
                                name="id_mascota"
                                value={formData.id_mascota}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_mascota ? 'input-error' : ''}
                                disabled={isSubmitting || !formData.id_cliente}
                            >
                                <option value="">Selecciona una mascota</option>
                                {filteredMascotas.map(mascota => (
                                    <option key={mascota.id_mascota} value={mascota.id_mascota}>
                                        {mascota.nombre} ({mascota.especie})
                                    </option>
                                ))}
                            </select>
                        )}
                        {formErrors.id_mascota && <span className="error-text">{formErrors.id_mascota}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="id_servicio">Servicio Principal:</label>
                        <select
                            id="id_servicio"
                            name="id_servicio"
                            value={formData.id_servicio}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.id_servicio ? 'input-error' : ''}
                            disabled={isSubmitting}
                        >
                            <option value="">Selecciona un servicio</option>
                            {servicios.map(servicio => (
                                <option key={servicio.id_servicio} value={servicio.id_servicio}>
                                    {servicio.nombre} (${servicio.precio})
                                </option>
                            ))}
                        </select>
                        {formErrors.id_servicio && <span className="error-text">{formErrors.id_servicio}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="id_veterinario">Veterinario Asignado:</label>
                        <select
                            id="id_veterinario"
                            name="id_veterinario"
                            value={formData.id_veterinario}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.id_veterinario ? 'input-error' : ''}
                            disabled={isSubmitting}
                        >
                            <option value="">Asignar automáticamente</option>
                            {veterinarios.map(vet => (
                                <option key={vet.id} value={vet.id}>
                                    {vet.nombre} {vet.apellido} ({vet.email})
                                </option>
                            ))}
                        </select>
                        {formErrors.id_veterinario && <span className="error-text">{formErrors.id_veterinario}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="fecha_cita">Fecha y Hora:</label>
                        <input
                            type="datetime-local"
                            id="fecha_cita"
                            name="fecha_cita"
                            value={formData.fecha_cita}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.fecha_cita ? 'input-error' : ''}
                            disabled={isSubmitting}
                        />
                        {formErrors.fecha_cita && <span className="error-text">{formErrors.fecha_cita}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="notas_adicionales">Notas Adicionales / Ubicación:</label>
                        <input
                            type="text"
                            id="notas_adicionales"
                            name="notas_adicionales"
                            value={formData.notas_adicionales}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.notas_adicionales ? 'input-error' : ''}
                            disabled={isSubmitting}
                        />
                        {formErrors.notas_adicionales && <span className="error-text">{formErrors.notas_adicionales}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="estado">Estado:</label>
                        <select
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={formErrors.estado ? 'input-error' : ''}
                            disabled={isSubmitting}
                        >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="ACEPTADA">ACEPTADA</option>
                            <option value="RECHAZADA">RECHAZADA</option>
                            <option value="COMPLETA">COMPLETA</option>
                            <option value="CANCELADA">CANCELADA</option>
                        </select>
                        {formErrors.estado && <span className="error-text">{formErrors.estado}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />} {appointment ? 'Actualizar Cita' : 'Agendar Cita'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                        <FaTimes /> Cancelar
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AdminAppointmentFormUI;