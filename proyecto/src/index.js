// src/index.js o src/main.jsx (tu archivo principal de entrada)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// No importes showConsoleWarning aquí, se importará y llamará desde App.js condicionalmente.


// =====================================================================
// *** LÓGICA DE SUPRESIÓN Y MANEJO DE ERRORES EN PRODUCCIÓN ***
// Esto debe ejecutarse ANTES de que cualquier otro script de tu aplicación cargue
// para asegurar que los métodos de console y los manejadores de errores se configuren.
// =====================================================================
if (process.env.NODE_ENV === 'production') {
  // 1. Guardar el console.log original para nuestro mensaje de advertencia
  window._originalConsoleLog = console.log;

  // 2. Sobrescribir todos los métodos de console para suprimirlos
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.clear = () => {}; // También suprime console.clear

  // 3. Capturar errores de JavaScript no capturados (unhandled errors)
  window.onerror = function (message, source, lineno, colno, error) {
    // Aquí puedes enviar el error a un servicio de monitoreo de errores (ej. Sentry, Bugsnag)
    // Pero NO lo imprimas en la consola si el objetivo es que esté totalmente limpia.
    // console.error("Unhandled JS Error:", message, source, lineno, colno, error); // ¡Comentar en prod!
    return true; // Suprime el error en la consola del navegador
  };

  // 4. Capturar promesas rechazadas no manejadas (unhandled promise rejections)
  window.addEventListener('unhandledrejection', (event) => {
    // Aquí puedes enviar el error a un servicio de monitoreo de errores
    // Pero NO lo imprimas en la consola.
    // console.error("Unhandled Promise Rejection:", event.reason); // ¡Comentar en prod!
    event.preventDefault(); // Evita que el navegador imprima el error por defecto
  });

  // 5. Opcional: Bloquear el acceso al 'debugger' (efectividad limitada)
  // Esto puede causar un bucle si las herramientas de desarrollador están abiertas,
  // pero no es una solución robusta y es fácil de evadir.
  // const _debugger = function() {};
  // setInterval(() => {
  //   if (window.performance && window.performance.mark && !(_debugger.toString().indexOf('debugger') > -1)) {
  //     // Esta es una técnica para detectar herramientas de desarrollador
  //     // y activar un bucle infinito que "bloquee" la consola.
  //     // No es infalible y puede ser molesto para usuarios legítimos.
  //     // Mejor evitarla a menos que haya una necesidad de seguridad extrema y entendida.
  //     // debugger; // Descomentar solo si realmente quieres esta funcionalidad.
  //   }
  // }, 100);

}
// =====================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);