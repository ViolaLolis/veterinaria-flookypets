import React, { useState } from 'react';
import './Styles/AdminIntegrations.css';

const integrationsList = [
  { id: 1, name: 'Google Calendar', connected: false },
  { id: 2, name: 'Stripe Payments', connected: true },
  { id: 3, name: 'Mailchimp', connected: false },
];

const AdminIntegrations = () => {
  const [integrations, setIntegrations] = useState(integrationsList);

  const toggleConnection = (id) => {
    setIntegrations(integrations.map(integration => 
      integration.id === id 
        ? { ...integration, connected: !integration.connected } 
        : integration
    ));
  };

  return (
    <div className="integrations-container">
      <h2>Integraciones</h2>
      <div className="integrations-grid">
        {integrations.map(integration => (
          <div key={integration.id} className="integration-card">
            <h3>{integration.name}</h3>
            <p>
              Estado: 
              <span className={integration.connected ? 'connected' : 'disconnected'}>
                {integration.connected ? ' Conectado' : ' Desconectado'}
              </span>
            </p>
            <button 
              onClick={() => toggleConnection(integration.id)}
              className={integration.connected ? 'disconnect-btn' : 'connect-btn'}
            >
              {integration.connected ? 'Desconectar' : 'Conectar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminIntegrations;