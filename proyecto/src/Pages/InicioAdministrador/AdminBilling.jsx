import React, { useState } from 'react';
import './Styles/AdminBilling.css';

const AdminBilling = () => {
  const [invoices, setInvoices] = useState([
    { id: 1, client: 'Juan Pérez', date: '2023-11-01', amount: 150000, status: 'Pagada' },
    { id: 2, client: 'María Gómez', date: '2023-10-30', amount: 80000, status: 'Pendiente' },
  ]);

  return (
    <div className="billing-container">
      <h2>Facturación</h2>
      <table className="billing-table">
        <thead>
          <tr>
            <th>ID Factura</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.id}>
              <td>#{invoice.id}</td>
              <td>{invoice.client}</td>
              <td>{invoice.date}</td>
              <td>${invoice.amount.toLocaleString()}</td>
              <td>
                <span className={`status ${invoice.status.toLowerCase()}`}>
                  {invoice.status}
                </span>
              </td>
              <td>
                <button className="view-btn">Ver</button>
                <button className="edit-btn">Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBilling;