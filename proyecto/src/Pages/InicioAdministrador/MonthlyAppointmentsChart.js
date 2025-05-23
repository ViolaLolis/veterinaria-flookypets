import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Styles/InicioAdministrador.css';

const MonthlyAppointmentsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/citas/mensuales');
        if (!response.ok) throw new Error('Error al obtener citas');
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <div className="chart-loading">Cargando datos de citas...</div>;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="semana" 
            tick={{ fill: '#555' }}
            axisLine={{ stroke: '#ccc' }}
          />
          <YAxis 
            tick={{ fill: '#555' }}
            axisLine={{ stroke: '#ccc' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Bar 
            dataKey="citas" 
            fill="#3498db" 
            radius={[4, 4, 0, 0]}
            name="Citas registradas"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyAppointmentsChart;