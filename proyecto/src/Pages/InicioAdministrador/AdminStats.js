// src/Pages/InicioAdministrador/AdminStats.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaStethoscope, FaUserShield, FaBriefcaseMedical, FaCalendarAlt, FaChartLine, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta
import './Styles/AdminStats.css'; // Asegúrate de que este CSS exista
import { useNotifications } from '../../Notifications/NotificationContext'; // Importa el hook de notificaciones

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
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
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
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <FaInfoCircle className="info-icon" />
                {error}
                <p>Asegúrate de que el backend esté corriendo y los endpoints de API estén accesibles y funcionando correctamente.</p>
            </div>
        );
    }

    return (
        <div className="admin-stats-container">
            <h2 className="stats-header">
                <FaChartLine className="header-icon" /> Dashboard de Estadísticas
            </h2>

            <div className="stats-grid">
                <div className="stat-card">
                    <FaUsers className="stat-icon" />
                    <h3>Clientes Registrados</h3>
                    <p>{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                    <FaStethoscope className="stat-icon" />
                    <h3>Veterinarios Activos</h3>
                    <p>{stats.totalVets}</p>
                </div>
                <div className="stat-card">
                    <FaUserShield className="stat-icon" />
                    <h3>Administradores</h3>
                    <p>{stats.totalAdmins}</p>
                </div>
                <div className="stat-card">
                    <FaBriefcaseMedical className="stat-icon" />
                    <h3>Servicios Ofrecidos</h3>
                    <p>{stats.totalServices}</p>
                </div>
                <div className="stat-card">
                    <FaCalendarAlt className="stat-icon" />
                    <h3>Citas este Mes</h3>
                    <p>{stats.totalAppointments}</p>
                </div>
                <div className="stat-card">
                    <FaChartLine className="stat-icon" />
                    <h3>Crecimiento Mensual</h3>
                    <p>{stats.monthlyGrowth}%</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-card">
                    <h3>Citas por Mes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={citasPorMes} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="cantidad" stroke="#8884d8" activeDot={{ r: 8 }} name="Número de Citas" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>Servicios Más Populares</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={serviciosPopulares} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="servicio" interval={0} angle={-30} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cantidad" fill="#82ca9d" name="Cantidad de Citas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default AdminStats;
