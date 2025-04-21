import React, { useState } from 'react';
import './Styles/ChatSoporte.css'; // Importa el CSS

const ChatSoporte = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'user' }]);
      setNewMessage('');
      // Aquí iría la lógica para enviar el mensaje al backend y recibir respuestas
      setTimeout(() => {
        setMessages([...messages, { text: 'Hola, ¿en qué puedo ayudarte?', sender: 'support' }]);
      }, 1000); // Simulación de respuesta del soporte
    }
  };

  return (
    <div className="chat-soporte-container">
      <h2 className="chat-soporte-title">Chat de Soporte</h2>
      <div className="chat-soporte-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-soporte-input">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatSoporte;