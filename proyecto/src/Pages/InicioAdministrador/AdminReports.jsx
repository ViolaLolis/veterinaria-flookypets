import React, { useState } from 'react';
import './Styles/AdminReports.css';

const AdminReports = () => {
  const [reportType, setReportType] = useState('appointments');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulación de generación de reporte
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Reporte de ${reportType} generado correctamente`);
    }, 2000);
  };

  return (
    <div className="admin-reports-container">
      <h2>Generar Reportes</h2>
      
      <div className="report-controls">
        <div className="form-group">
          <label>Tipo de Reporte:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="appointments">Citas</option>
            <option value="services">Servicios</option>
            <option value="users">Usuarios</option>
            <option value="pets">Mascotas</option>
            <option value="payments">Pagos</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Fecha de Inicio:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Fecha de Fin:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        <button
          className="generate-btn"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generando...' : 'Generar Reporte'}
        </button>
      </div>
      
      <div className="report-preview">
        <h3>Vista Previa del Reporte</h3>
        <div className="preview-placeholder">
          {reportType === 'appointments' && <p>Reporte de Citas del {startDate} al {endDate}</p>}
          {reportType === 'services' && <p>Reporte de Servicios del {startDate} al {endDate}</p>}
          {reportType === 'users' && <p>Reporte de Usuarios registrados del {startDate} al {endDate}</p>}
          {reportType === 'pets' && <p>Reporte de Mascotas registradas del {startDate} al {endDate}</p>}
          {reportType === 'payments' && <p>Reporte de Pagos del {startDate} al {endDate}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;