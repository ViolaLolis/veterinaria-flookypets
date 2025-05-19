export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  export const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };
  
  export const formatDateTime = (dateString, timeString) => {
    return `${formatDate(dateString)} a las ${formatTime(timeString)}`;
  };
  
  export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  export const getRoleName = (role) => {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'veterinario': return 'Veterinario';
      case 'usuario': return 'Usuario';
      default: return capitalize(role);
    }
  };
  
  export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePhone = (phone) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone);
  };