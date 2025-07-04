// src/Utils/consoleWarning.js

export const showConsoleWarning = () => {
  if (window.console && typeof window.console.log === 'function') {
    const message = `
%c¡DETENTE!
%cEsta función del navegador está pensada para desarrolladores.
Si alguien te indicó que copiaras y pegaras algo aquí para habilitar una función de ${window.location.hostname} o para "hackear" la cuenta de alguien, se trata de un fraude. Si lo haces, esta persona podrá acceder a tu cuenta.

Consulta https://www.facebook.com/selfxss para obtener más información.
`.trim();

    const styles = [
      'font-size: 40px',
      'font-weight: bold',
      'color: red',
      'text-shadow: 2px 2px 4px rgba(0,0,0,0.5)',
      'background: yellow',
      'padding: 10px 20px',
      'border-radius: 5px',
      'margin-bottom: 10px'
    ].join(';');

    const normalStyles = [
      'font-size: 16px',
      'color: black',
      'line-height: 1.5',
      'margin-bottom: 5px'
    ].join(';');

    // IMPORTE CLAVE: Llamamos al console.log ORIGINAL (guardado antes de ser suprimido)
    // para asegurarnos de que este mensaje sí se imprima.
    // Esto requiere un pequeño cambio en index.js/App.js para guardar el console original.
    if (window._originalConsoleLog) { // Verificamos si hemos guardado el original
      window._originalConsoleLog(message, styles, normalStyles);
    } else {
      // Fallback si por alguna razón no se guardó el original (no debería pasar en prod si se sigue el orden)
      console.log(message, styles, normalStyles);
    }
  }
};