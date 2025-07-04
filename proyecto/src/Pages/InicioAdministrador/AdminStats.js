import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaStethoscope, FaUserShield, FaBriefcaseMedical, FaCalendarAlt, FaChartLine, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { authFetch } from '../../utils/api';
import './Styles/AdminStats.css'; // Asegúrate de que esta sea la ruta correcta
import { useNotifications } from '../../Notifications/NotificationContext';

function AdminStats({ user }) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalVets: 0,
        totalAdmins: 0,
        totalServices: 0,
        totalAppointments: 0,
        monthlyGrowth: 0
    });
    const [citasPorMes, setCitasPorMes] = useState([]);
    const [serviciosPopulares, setServiciosPopulares] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications();

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Asegúrate de que estos endpoints existan en tu server.txt
            const [statsRes, citasRes, serviciosRes] = await Promise.all([
                authFetch('/admin/stats'),
                authFetch('/api/stats/citas-por-mes'),
                authFetch('/api/stats/servicios-populares')
            ]);

            if (statsRes.success) {
                setStats(statsRes.data);
            } else {
                addNotification('error', statsRes.message || 'Error al cargar estadísticas generales.', 5000);
                setError(statsRes.message || 'Error al cargar estadísticas generales.');
            }

            if (citasRes.success) {
                setCitasPorMes(citasRes.data);
            } else {
                addNotification('error', citasRes.message || 'Error al cargar citas por mes.', 5000);
                setError(citasRes.message || 'Error al cargar citas por mes.');
            }

            if (serviciosRes.success) {
                setServiciosPopulares(serviciosRes.data);
            } else {
                addNotification('error', serviciosRes.message || 'Error al cargar servicios populares.', 5000);
                setError(serviciosRes.message || 'Error al cargar servicios populares.');
            }

        } catch (err) {
            setError(`Error de conexión al cargar estadísticas: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error fetching stats:", err);
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchStats();
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchStats]);

    if (isLoading) {
        return (
            <div className="admin-loading-container"> {/* Renombrado para consistencia */}
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-error-message"> {/* Renombrado para consistencia */}
                <FaInfoCircle className="admin-info-icon" /> {/* Renombrado para consistencia */}
                {error}
                <p>Asegúrate de que el backend esté corriendo y los endpoints de API estén accesibles y funcionando correctamente.</p>
            </div>
        );
    }

    return (
        <div className="admin-stats-main-container"> {/* Contenedor principal de la página */}
            <p className="admin-stats-greeting-text">Hola, Administrador {user?.nombre}!</p>
            <p className="admin-stats-subheader-message">Aquí tienes un resumen de las estadísticas clave de tu clínica veterinaria.</p>

            <div className="admin-stats-section-wrapper"> {/* Contenedor para la sección de estadísticas generales */}
                <h2 className="admin-stats-section-header">
                    <FaChartLine className="admin-stats-section-icon" /> Estadísticas Generales
                </h2>

                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-card-header">
                            <FaUsers className="admin-stat-icon" style={{ color: '#00acc1' }} /> {/* Color para icono */}
                            <h3>Clientes Registrados</h3>
                        </div>
                        <p className="admin-stat-highlight">{stats.totalUsers}</p>
                        <p className="admin-stat-footer">Total de clientes activos.</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-card-header">
                            <FaStethoscope className="admin-stat-icon" style={{ color: '#4CAF50' }} /> {/* Color para icono */}
                            <h3>Veterinarios Activos</h3>
                        </div>
                        <p className="admin-stat-highlight">{stats.totalVets}</p>
                        <p className="admin-stat-footer">Número de profesionales.</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-card-header">
                            <FaUserShield className="admin-stat-icon" style={{ color: '#ffc107' }} /> {/* Color para icono */}
                            <h3>Administradores</h3>
                        </div>
                        <p className="admin-stat-highlight">{stats.totalAdmins}</p>
                        <p className="admin-stat-footer">Personal administrativo.</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-card-header">
                            <FaBriefcaseMedical className="admin-stat-icon" style={{ color: '#2196F3' }} /> {/* Color para icono */}
                            <h3>Servicios Ofrecidos</h3>
                        </div>
                        <p className="admin-stat-highlight">{stats.totalServices}</p>
                        <p className="admin-stat-footer">Número total de servicios.</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-card-header">
                            <FaCalendarAlt className="admin-stat-icon" style={{ color: '#FF5722' }} /> {/* Color para icono */}
                            <h3>Citas este Mes</h3>
                        </div>
                        <p className="admin-stat-highlight">{stats.totalAppointments}</p>
                        <p className="admin-stat-footer">Citas agendadas en el mes actual.</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-card-header">
                            <FaChartLine className="admin-stat-icon" style={{ color: '#9C27B0' }} /> {/* Color para icono */}
                            <h3>Crecimiento Mensual</h3>
                        </div>
                        <p className="admin-stat-highlight">
                            {stats.monthlyGrowth > 0 ? `+${stats.monthlyGrowth}` : stats.monthlyGrowth}%
                        </p>
                        <p className="admin-stat-footer">Comparado con el mes anterior.</p>
                    </div>
                </div>
            </div>

            <div className="admin-charts-container"> {/* Contenedor para los gráficos */}
                <div className="admin-chart-card">
                    <h3>Citas por Mes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={citasPorMes} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="mes" stroke="#7f8c8d" />
                            <YAxis stroke="#7f8c8d" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '10px'
                                }}
                                labelStyle={{ color: '#2c3e50', fontWeight: 'bold' }}
                                itemStyle={{ color: '#00acc1' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px', color: '#555' }} />
                            <Line type="monotone" dataKey="cantidad" stroke="#00acc1" strokeWidth={2} activeDot={{ r: 8, fill: '#00acc1', stroke: '#b2ebf2', strokeWidth: 2 }} name="Número de Citas" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="admin-chart-card">
                    <h3>Servicios Más Populares</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={serviciosPopulares} margin={{ top: 15, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="servicio" interval={0} angle={-30} textAnchor="end" height={80} stroke="#7f8c8d" />
                            <YAxis stroke="#7f8c8d" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '10px'
                                }}
                                labelStyle={{ color: '#2c3e50', fontWeight: 'bold' }}
                                itemStyle={{ color: '#4CAF50' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px', color: '#555' }} />
                            <Bar dataKey="cantidad" fill="#4CAF50" name="Cantidad de Citas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default AdminStats;