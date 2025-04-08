import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../Styles/UserMenu.css";

function UserMenu({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mascotas');
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestPetId, setRequestPetId] = useState(null);
  const [requestNote, setRequestNote] = useState('');

  // Datos de ejemplo
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const petsData = [
          { 
            id: 1, 
            name: "Max", 
            type: "Perro", 
            breed: "Labrador",
            age: 3,
            weight: "28 kg",
            lastVisit: "2023-05-15",
            medicalHistory: [
              { date: "2023-05-15", description: "Consulta anual", vet: "Dra. Rodríguez" },
              { date: "2023-03-10", description: "Vacuna antirrábica", vet: "Dra. Rodríguez" }
            ]
          },
          { 
            id: 2, 
            name: "Luna", 
            type: "Gato", 
            breed: "Siamés",
            age: 2,
            weight: "4 kg",
            lastVisit: "2023-04-20",
            medicalHistory: [
              { date: "2023-04-20", description: "Control postoperatorio", vet: "Dr. Pérez" }
            ]
          }
        ];

        const appointmentsData = [
          { 
            id: 1, 
            petId: 1,
            petName: "Max", 
            date: "15 Mayo 2023", 
            time: "10:00 AM", 
            service: "Consulta General",
            status: "confirmada",
            notes: "Control de peso"
          },
          { 
            id: 2, 
            petId: 2,
            petName: "Luna", 
            date: "20 Mayo 2023", 
            time: "3:30 PM", 
            service: "Vacunación",
            status: "confirmada",
            notes: "Refuerzo anual"
          },
          {
            id: 3,
            petId: 1,
            petName: "Max",
            date: "10 Abril 2023",
            time: "11:00 AM",
            service: "Estética",
            status: "completada"
          }
        ];

        const servicesData = [
          { 
            id: 1, 
            name: "Consulta General", 
            description: "Revisión básica de salud", 
            price: "$50",
            duration: "30 min",
            category: "Salud"
          },
          { 
            id: 2, 
            name: "Vacunación", 
            description: "Aplicación de vacunas", 
            price: "$30",
            duration: "20 min",
            category: "Prevención"
          },
          { 
            id: 3, 
            name: "Estética", 
            description: "Corte de pelo y cuidados", 
            price: "$40",
            duration: "45 min",
            category: "Belleza"
          }
        ];

        setPets(petsData);
        setAppointments(appointmentsData);
        setServices(servicesData);
      } catch (err) {
        setError("Error al cargar los datos. Por favor intente más tarde.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleRequest = (type, petId = null) => {
    setRequestType(type);
    setRequestPetId(petId);
    setShowRequestModal(true);
  };

  const submitRequest = () => {
    // Aquí iría la lógica para enviar la solicitud al administrador
    alert(`Solicitud de ${getRequestText()} enviada para revisión`);
    setShowRequestModal(false);
    setRequestNote('');
  };

  const getRequestText = () => {
    switch(requestType) {
      case 'agregar': return 'nueva mascota';
      case 'editar': return `edición de ${pets.find(p => p.id === requestPetId)?.name}`;
      case 'eliminar': return `eliminación de ${pets.find(p => p.id === requestPetId)?.name}`;
      default: return '';
    }
  };

  const upcomingAppointments = appointments.filter(app => app.status === 'confirmada');
  const pastAppointments = appointments.filter(app => app.status === 'completada');

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      );
    }

    switch(activeTab) {
      case 'mascotas':
        return (
          <div className="pets-section">
            <div className="section-header">
              <h2>Mis Mascotas</h2>
              <button 
                className="add-button"
                onClick={() => handleRequest('agregar')}
              >
                + Solicitar nueva mascota
              </button>
            </div>
            
            {pets.length === 0 ? (
              <div className="empty-state">
                <p>No tienes mascotas registradas</p>
                <button 
                  className="action-button"
                  onClick={() => handleRequest('agregar')}
                >
                  Solicitar registro de mascota
                </button>
              </div>
            ) : (
              <div className="pets-grid">
                {pets.map(pet => (
                  <div key={pet.id} className="pet-card">
                    <div className="pet-avatar">
                      {pet.type === 'Perro' ? '🐶' : '🐱'}
                    </div>
                    <div className="pet-info">
                      <h3>{pet.name}</h3>
                      <p><strong>Raza:</strong> {pet.breed}</p>
                      <p><strong>Edad:</strong> {pet.age} años</p>
                      <p><strong>Última visita:</strong> {pet.lastVisit || 'Nunca'}</p>
                    </div>
                    <div className="pet-actions">
                      <button 
                        className="action-button"
                        onClick={() => navigate(`/mascota/${pet.id}`, { state: { pet } })}
                      >
                        Ver detalles
                      </button>
                      <button 
                        className="action-button secondary"
                        onClick={() => handleRequest('editar', pet.id)}
                      >
                        Solicitar edición
                      </button>
                      <button 
                        className="action-button danger"
                        onClick={() => handleRequest('eliminar', pet.id)}
                      >
                        Solicitar eliminación
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'citas':
        return (
          <div className="appointments-section">
            <div className="section-header">
              <h2>Próximas Citas</h2>
              <button 
                className="add-button"
                onClick={() => navigate('/nueva-cita', { state: { pets } })}
              >
                + Nueva Cita
              </button>
            </div>
            
            {upcomingAppointments.length === 0 ? (
              <div className="empty-state">
                <p>No tienes citas programadas</p>
                <button 
                  className="action-button"
                  onClick={() => navigate('/nueva-cita', { state: { pets } })}
                >
                  Agendar mi primera cita
                </button>
              </div>
            ) : (
              <>
                <div className="appointments-list">
                  {upcomingAppointments.map(app => (
                    <div key={app.id} className={`appointment-card ${app.status}`}>
                      <div className="appointment-date">
                        <span className="date">{app.date}</span>
                        <span className="time">{app.time}</span>
                      </div>
                      <div className="appointment-details">
                        <h3>{app.service}</h3>
                        <p>Para: {app.petName}</p>
                        <span className={`status-badge ${app.status}`}>
                          Confirmada
                        </span>
                      </div>
                      <div className="appointment-actions">
                        <button 
                          className="action-button small"
                          onClick={() => navigate(`/reagendar-cita/${app.id}`, { 
                            state: { 
                              appointment: app,
                              pets 
                            } 
                          })}
                        >
                          Reagendar
                        </button>
                        <button 
                          className="action-button small danger"
                          onClick={() => {
                            if (window.confirm("¿Estás seguro de cancelar esta cita?")) {
                              setAppointments(appointments.map(a => 
                                a.id === app.id ? { ...a, status: 'cancelada' } : a
                              ));
                            }
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="view-all"
                  onClick={() => navigate('/todas-citas', { state: { appointments, pets } })}
                >
                  Ver historial de citas →
                </button>
              </>
            )}
          </div>
        );
      case 'servicios':
        return (
          <div className="services-section">
            <h2>Nuestros Servicios</h2>
            
            <div className="services-grid">
              {services.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <h3>{service.name}</h3>
                    <span className="service-category">{service.category}</span>
                  </div>
                  <p>{service.description}</p>
                  <div className="service-meta">
                    <span>⏱️ {service.duration}</span>
                    <span>💵 {service.price}</span>
                  </div>
                  <button 
                    className="action-button small"
                    onClick={() => navigate('/nueva-cita', { 
                      state: { 
                        service: service.name,
                        duration: service.duration,
                        pets 
                      } 
                    })}
                  >
                    Agendar
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'perfil':
        return (
          <div className="profile-section">
            <h2>Mi Perfil</h2>
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {user?.name?.charAt(0) || '👤'}
                </div>
                <div>
                  <h3>{user?.name || 'Usuario'}</h3>
                  <p>{user?.email || 'usuario@example.com'}</p>
                </div>
              </div>
              
              <div className="profile-details">
                <div className="detail-item">
                  <label>Rol:</label>
                  <span>{user?.role || 'Usuario'}</span>
                </div>
                <div className="detail-item">
                  <label>Teléfono:</label>
                  <span>{user?.phone || 'No registrado'}</span>
                </div>
                <div className="detail-item">
                  <label>Dirección:</label>
                  <span>{user?.address || 'No registrada'}</span>
                </div>
                <div className="detail-item">
                  <label>Mascotas registradas:</label>
                  <span>{pets.length}</span>
                </div>
              </div>
              
              <div className="profile-actions">
                <button 
                  className="action-button"
                  onClick={() => navigate('/editar-perfil')}
                >
                  Editar Perfil
                </button>
                <button 
                  className="action-button secondary"
                  onClick={() => navigate('/cambiar-contrasena')}
                >
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-menu-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo-title">
            <span className="logo">🐾</span>
            <h1>Flooky Pets</h1>
          </div>
          <p>Hola, {user?.name || 'Usuario'}</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-button ${activeTab === 'mascotas' ? 'active' : ''}`}
            onClick={() => setActiveTab('mascotas')}
          >
            <span className="nav-icon">🐕</span>
            <span>Mis Mascotas</span>
            {pets.length > 0 && <span className="badge">{pets.length}</span>}
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'citas' ? 'active' : ''}`}
            onClick={() => setActiveTab('citas')}
          >
            <span className="nav-icon">📅</span>
            <span>Mis Citas</span>
            {upcomingAppointments.length > 0 && (
              <span className="badge">{upcomingAppointments.length}</span>
            )}
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'servicios' ? 'active' : ''}`}
            onClick={() => setActiveTab('servicios')}
          >
            <span className="nav-icon">🏥</span>
            <span>Servicios</span>
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            <span className="nav-icon">👤</span>
            <span>Mi Perfil</span>
          </button>
        </nav>
        
        <button className="logout-button" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
      
      <div className="main-content">
        {renderContent()}
      </div>

      {/* Modal de solicitud */}
      {showRequestModal && (
        <div className="request-modal">
          <div className="modal-content">
            <h3>Solicitud de {getRequestText()}</h3>
            
            {requestType !== 'agregar' && (
              <p>Mascota: {pets.find(p => p.id === requestPetId)?.name}</p>
            )}
            
            <textarea
              placeholder={`Explique el motivo de su solicitud...`}
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              rows="4"
            />
            
            <div className="modal-actions">
              <button 
                className="modal-button cancel"
                onClick={() => setShowRequestModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-button confirm"
                onClick={submitRequest}
                disabled={!requestNote}
              >
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;