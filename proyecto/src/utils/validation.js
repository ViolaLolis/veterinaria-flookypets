/**
 * Expresiones regulares para validación y seguridad.
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?(\d{1,4})?[-.\s]?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}$/; // Más flexible para números internacionales
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
const alphanumericRegex = /^[a-zA-Z0-9\s.,#\-/()]+$/; // Para direcciones, etc.
const documentNumberRegex = /^[a-zA-Z0-9-]+$/; // Para números de documento
const positiveNumberRegex = /^\d+(\.\d+)?$/; // Para números positivos, enteros o decimales

// Patrones de seguridad básicos
const sqlInjectionKeywords = /(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|UNION|TRUNCATE|EXEC|xp_cmdshell|--|;)/i;
const xssKeywords = /(<script>|javascript:|onerror|onload|onmouseover|alert\(|prompt\(|confirm\(|<iframe|<img|<link|<body|<html|<style)/i; // Ampliado para más tags/atributos XSS
const commonBadWords = ['sexo', 'puta', 'mierda', 'coño', 'joder', 'fuck', 'shit', 'asshole', 'verga', 'cabra', 'hijueputa', 'gonorrea']; // Ejemplo, expandir según necesidad local/contexto
const repetitivePattern = /(.)\1{3,}/; // Cuatro o más caracteres repetidos (ej. aaaa)
const sequentialPattern = /(abc|bcd|cde|def|123|234|345|qwe|wer|ert|asd|sdf|dfg|zxc|xcv|cvb|poi|lkj|mnb|iop|hjk)/i; // Secuencias comunes ampliado
const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u; // Detecta la mayoría de emojis

/**
 * Valida un campo de formulario específico.
 * @param {string} fieldName - El nombre del campo (ej. 'email', 'password').
 * @param {string} value - El valor actual del campo.
 * @param {object} allFormData - Todos los datos del formulario para validaciones interdependientes (ej. confirmPassword).
 * @param {boolean} isNewEntry - Indica si es un nuevo registro (true) o una edición (false).
 * @param {string} originalEmail - El email original del usuario/veterinario/admin si está en modo edición.
 * @returns {string|null} Un mensaje de error si la validación falla, de lo contrario null.
 */
export const validateField = (fieldName, value, allFormData = {}, isNewEntry = false, originalEmail = '') => {
    // Si el valor es nulo o indefinido, lo convertimos a cadena vacía para asegurar .trim() funciona.
    const trimmedValue = typeof value === 'string' ? value.trim() : '';
    let message = null;

    // --- Validaciones de Seguridad Generales (aplicar a la mayoría de campos de texto) ---
    // Prevenir SQL Injection
    if (sqlInjectionKeywords.test(trimmedValue)) {
        return 'Contenido sospechoso detectado. Por favor, evita caracteres o palabras clave de comandos SQL.';
    }
    // Prevenir XSS (Cross-Site Scripting)
    if (xssKeywords.test(trimmedValue)) {
        return 'Contenido sospechoso detectado. Por favor, evita scripts o código malicioso.';
    }
    // Prevenir emojis (si no se desean) - Descomentar si es necesario
    /*
    if (emojiRegex.test(trimmedValue)) {
        return 'No se permiten emojis en este campo.';
    }
    */
    // Prevenir palabras ofensivas (ejemplo) - Solo para campos de texto libre
    if (['diagnostico', 'tratamiento', 'observaciones', 'descripcion_servicio', 'notas_adicionales_cita'].includes(fieldName) &&
        commonBadWords.some(word => trimmedValue.toLowerCase().includes(word))) {
        return 'Contenido inapropiado detectado.';
    }
    // Prevenir patrones repetitivos o secuenciales (para contraseñas, nombres, etc.)
    if (repetitivePattern.test(trimmedValue) || sequentialPattern.test(trimmedValue)) {
        if (['password', 'confirmPassword', 'nombre', 'apellido'].includes(fieldName)) { // Extendido a nombres/apellidos
            return `Evita patrones repetitivos o secuenciales en ${fieldName === 'password' || fieldName === 'confirmPassword' ? 'la contraseña' : 'el nombre/apellido'}.`;
        }
    }


    // --- Validaciones Específicas por Campo ---
    switch (fieldName) {
        case 'nombre':
        case 'apellido':
            if (!trimmedValue) {
                message = `El ${fieldName} es requerido.`;
            } else if (trimmedValue.length < 2) {
                message = 'Debe tener al menos 2 caracteres.';
            } else if (trimmedValue.length > 50) {
                message = 'No debe exceder los 50 caracteres.';
            } else if (!nameRegex.test(trimmedValue)) {
                message = 'Solo se permiten letras, espacios, guiones y apóstrofes.';
            }
            break;

        case 'email':
            if (!trimmedValue) {
                message = 'El email es requerido.';
            } else if (!emailRegex.test(trimmedValue)) {
                message = 'Formato de email inválido (ej. usuario@dominio.com).';
            } else if (trimmedValue.length > 100) {
                message = 'El email no debe exceder los 100 caracteres.';
            }
            // Validación de email genérico/de prueba:
            // Solo aplica si es una nueva entrada O si el email ha cambiado Y el nuevo email es genérico.
            const isGenericEmail = /(test|demo|example|placeholder|temp|prueba|admin|root|qwerty|password)@/i.test(trimmedValue) ||
                                   /(test|demo|example|placeholder|temp|prueba|admin|root|qwerty|password)\.com/i.test(trimmedValue);
            if (isGenericEmail && (isNewEntry || (trimmedValue !== originalEmail))) {
                message = 'El email es demasiado genérico o de prueba. Por favor, usa un email real.';
            }
            break;

        case 'telefono':
            if (!trimmedValue) {
                message = 'El teléfono es requerido.';
            } else if (!phoneRegex.test(trimmedValue)) {
                message = 'Formato de teléfono inválido (ej. +57 310 123 4567, 3101234567).';
            } else if (trimmedValue.replace(/\D/g, '').length < 7 || trimmedValue.replace(/\D/g, '').length > 15) { // Contar solo dígitos
                message = 'El teléfono debe tener entre 7 y 15 dígitos.';
            }
            break;

        case 'direccion':
            // La dirección es opcional, solo valida si se proporciona un valor
            if (trimmedValue) {
                if (trimmedValue.length < 5) {
                    message = 'La dirección debe tener al menos 5 caracteres.';
                } else if (trimmedValue.length > 100) {
                    message = 'La dirección no debe exceder los 100 caracteres.';
                } else if (!alphanumericRegex.test(trimmedValue)) {
                    message = 'La dirección contiene caracteres no permitidos.';
                } else if (trimmedValue.includes('..') || trimmedValue.includes('--') || trimmedValue.includes(',,') ||
                           trimmedValue.startsWith('.') || trimmedValue.endsWith('.') ||
                           trimmedValue.startsWith('-') || trimmedValue.endsWith('-') ||
                           trimmedValue.startsWith(',') || trimmedValue.endsWith(',')) {
                    message = 'Formato incorrecto de puntuación (ej. no al inicio/final o consecutivos).';
                }
                // Validación de estructura de dirección (ej. "Calle 123 #45-67") - Recomendado para Colombia
                else if (!/(calle|carrera|avenida|transversal|diagonal|cll|cra|av|tv|dg|kr|km)\s*\d+\s*(#|\snumero\s|no\s*)\s*\d+(\s*[a-zA-Z])?(\s*-\s*\d+)?(\s*[a-zA-Z])?\s*([a-zA-Z0-9\s#\-.]+)?$/i.test(trimmedValue)) {
                    message = 'Formato de dirección recomendado: Tipo de Vía (Calle, Carrera, Av) + Número de Vía + # + Número de Casa/Edificio (ej. Calle 15 #19C-55).';
                }
            }
            break;

        case 'password':
            // La contraseña es requerida para nuevas entradas, opcional para edición (si se deja vacío, no se cambia)
            if (isNewEntry || trimmedValue.length > 0) {
                if (!trimmedValue) {
                    message = 'La contraseña es requerida.';
                } else if (trimmedValue.length < 8) {
                    message = 'Debe tener al menos 8 caracteres.';
                } else if (!passwordRegex.test(trimmedValue)) {
                    message = 'Debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).';
                }
            }
            break;

        case 'confirmPassword':
            // Solo valida si se está creando un nuevo usuario o si se ha introducido una contraseña
            if (isNewEntry || (allFormData.password && allFormData.password.length > 0)) {
                if (!trimmedValue) {
                    message = 'Confirma tu contraseña.';
                } else if (trimmedValue !== allFormData.password) {
                    message = 'Las contraseñas no coinciden.';
                }
            }
            break;

        case 'tipo_documento':
            // Opcional, pero si se selecciona, debe ser una de las opciones válidas
            const validTypes = ['', 'CC', 'CE', 'TI', 'PASAPORTE', 'NIT', 'REGISTRO CIVIL']; // Añadido "Registro Civil"
            if (trimmedValue && !validTypes.includes(trimmedValue.toUpperCase())) {
                message = 'Tipo de documento inválido.';
            }
            break;

        case 'numero_documento':
            // Opcional, pero si se proporciona, debe ser alfanumérico y tener longitud razonable
            if (trimmedValue) {
                if (trimmedValue.length < 5 || trimmedValue.length > 20) {
                    message = 'El número de documento debe tener entre 5 y 20 caracteres.';
                } else if (!documentNumberRegex.test(trimmedValue)) {
                    message = 'El número de documento contiene caracteres no permitidos.';
                }
            }
            break;

        case 'fecha_nacimiento':
            // Opcional, pero si se proporciona, debe ser una fecha válida y razonable
            if (trimmedValue) {
                const birthDate = new Date(trimmedValue);
                const today = new Date();
                const minDate = new Date('1900-01-01'); // Fecha mínima razonable
                const maxAgeDate = new Date(); // No se puede nacer en el futuro
                maxAgeDate.setFullYear(maxAgeDate.getFullYear() - 120); // Edad máxima de 120 años para humanos

                if (isNaN(birthDate.getTime())) {
                    message = 'Fecha de nacimiento inválida.';
                } else if (birthDate > today) {
                    message = 'La fecha de nacimiento no puede ser en el futuro.';
                } else if (birthDate < maxAgeDate) { // Si la fecha es anterior a la fecha de hace 120 años
                    message = 'La fecha de nacimiento es demasiado antigua o inválida.';
                }
            }
            break;

        case 'experiencia':
        case 'universidad':
        case 'horario':
            // Estos campos son específicos de veterinarios, no deberían validarse para usuarios normales.
            // Si se validan, se asume que el rol ya ha sido filtrado.
            if (trimmedValue) { // Ahora estos campos son opcionales
                if (trimmedValue.length < 3) {
                    message = `El campo ${fieldName} debe tener al menos 3 caracteres.`;
                } else if (trimmedValue.length > (fieldName === 'experiencia' ? 255 : 255)) { // Ajustado experiencia a 255 si la DB lo permite
                    message = `El campo ${fieldName} no debe exceder los ${fieldName === 'experiencia' ? 255 : 255} caracteres.`;
                }
            }
            break;

        case 'nombre_mascota':
        case 'especie_mascota':
            if (!trimmedValue) {
                message = `El ${fieldName.replace('_mascota', '')} de la mascota es requerido.`;
            } else if (trimmedValue.length < 2 || trimmedValue.length > 100) {
                message = `El ${fieldName.replace('_mascota', '')} de la mascota debe tener entre 2 y 100 caracteres.`;
            } else if (!nameRegex.test(trimmedValue)) { // Reutiliza nameRegex para nombres de mascotas
                message = `El ${fieldName.replace('_mascota', '')} de la mascota solo permite letras, espacios, guiones y apóstrofes.`;
            }
            break;

        case 'raza_mascota':
            if (trimmedValue && (trimmedValue.length < 2 || trimmedValue.length > 100)) {
                message = 'La raza de la mascota debe tener entre 2 y 100 caracteres.';
            } else if (trimmedValue && !nameRegex.test(trimmedValue)) {
                message = 'La raza de la mascota solo permite letras y espacios.';
            }
            break;

        case 'edad_mascota':
            if (value !== null && value !== undefined && value !== '') { // Permitir vacío
                const age = parseInt(value, 10);
                if (isNaN(age) || age < 0 || age > 50) { // Asumiendo una edad máxima razonable para mascotas (algunas tortugas viven más)
                    message = 'La edad de la mascota debe ser un número entero entre 0 y 50.';
                }
            }
            break;

        case 'peso_mascota':
            if (value !== null && value !== undefined && value !== '') { // Permitir vacío
                const weight = parseFloat(value);
                if (isNaN(weight) || weight <= 0 || weight > 500) { // Asumiendo un peso máximo razonable (ej. para caballos o animales grandes)
                    message = 'El peso debe ser un número positivo (máx. 500 kg).';
                } else if (!positiveNumberRegex.test(value)) {
                    message = 'El peso debe ser un número válido.';
                }
            }
            break;

        case 'color_mascota':
            if (trimmedValue && (trimmedValue.length < 2 || trimmedValue.length > 50)) {
                message = 'El color de la mascota debe tener entre 2 y 50 caracteres.';
            } else if (trimmedValue && !nameRegex.test(trimmedValue)) {
                message = 'El color de la mascota solo permite letras y espacios.';
            }
            break;

        case 'microchip_mascota':
            if (trimmedValue) { // Microchip es opcional
                if (trimmedValue.length < 5 || trimmedValue.length > 50) {
                    message = 'El microchip debe tener entre 5 y 50 caracteres.';
                } else if (!alphanumericRegex.test(trimmedValue)) {
                    message = 'El microchip contiene caracteres no permitidos.';
                }
            }
            break;

        case 'id_propietario_mascota': // Asumiendo que es un ID numérico de usuario
            if (value === null || value === undefined || value === '') { // Es requerido
                message = 'El propietario de la mascota es requerido.';
            } else if (isNaN(parseInt(value, 10)) || parseInt(value, 10) <= 0) { // Debe ser un número entero positivo
                message = 'ID de propietario inválido.';
            }
            break;

        case 'fecha_cita':
            if (!trimmedValue) {
                message = 'La fecha y hora de la cita son requeridas.';
            } else {
                const appointmentDate = new Date(trimmedValue);
                const now = new Date();
                now.setSeconds(0, 0); // Comparar sin segundos/milisegundos
                if (isNaN(appointmentDate.getTime())) {
                    message = 'Formato de fecha y hora inválido.';
                } else if (appointmentDate < now) {
                    message = 'La cita no puede ser en el pasado.';
                }
            }
            break;

        case 'id_servicio_cita':
            if (value === null || value === undefined || value === '') { // Es requerido
                message = 'El servicio de la cita es requerido.';
            } else if (isNaN(parseInt(value, 10)) || parseInt(value, 10) <= 0) {
                message = 'ID de servicio inválido.';
            }
            break;

        case 'id_cliente_cita':
            if (value === null || value === undefined || value === '') { // Es requerido
                message = 'El cliente de la cita es requerido.';
            } else if (isNaN(parseInt(value, 10)) || parseInt(value, 10) <= 0) {
                message = 'ID de cliente inválido.';
            }
            break;

        case 'id_veterinario_cita':
            // Opcional, pero si se proporciona, debe ser un número entero positivo
            if (value !== null && value !== undefined && value !== '') {
                if (isNaN(parseInt(value, 10)) || parseInt(value, 10) <= 0) {
                    message = 'ID de veterinario inválido.';
                }
            }
            break;

        case 'id_mascota_cita':
            if (value === null || value === undefined || value === '') { // Es requerido
                message = 'La mascota de la cita es requerida.';
            } else if (isNaN(parseInt(value, 10)) || parseInt(value, 10) <= 0) {
                message = 'ID de mascota inválido.';
            }
            break;

        case 'estado_cita':
            const validStates = ['PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'COMPLETA', 'CANCELADA'];
            if (!trimmedValue) {
                message = 'El estado de la cita es requerido.';
            } else if (!validStates.includes(trimmedValue.toUpperCase())) {
                message = 'Estado de cita inválido.';
            }
            break;

        case 'notas_adicionales_cita':
        case 'diagnostico_historial':
        case 'tratamiento_historial':
        case 'observaciones_historial':
            if (trimmedValue && trimmedValue.length > 1000) {
                message = 'El texto no debe exceder los 1000 caracteres.';
            }
            // Asegurar que no esté vacío si se considera obligatorio en el contexto de un historial
            /*
            if (fieldName === 'diagnostico_historial' && !trimmedValue) {
                message = 'El diagnóstico es requerido.';
            }
            */
            break;

        case 'peso_actual_historial':
            if (value !== null && value !== undefined && value !== '') {
                const numVal = parseFloat(value);
                if (isNaN(numVal) || numVal <= 0) {
                    message = 'Debe ser un número positivo para el peso.';
                } else if (numVal > 500) { // Max 500kg para historial (misma lógica que peso_mascota)
                    message = 'El peso no debe exceder los 500 kg.';
                } else if (!positiveNumberRegex.test(value)) {
                    message = 'El peso debe ser un número válido (ej. 15.5).';
                }
            }
            break;

        case 'temperatura_historial':
            if (value !== null && value !== undefined && value !== '') {
                const numVal = parseFloat(value);
                if (isNaN(numVal) || numVal < 30 || numVal > 45) { // Rango más realista para animales 30-45
                    message = 'La temperatura debe ser un número entre 30°C y 45°C.';
                } else if (!positiveNumberRegex.test(value)) {
                    message = 'La temperatura debe ser un número válido (ej. 38.5).';
                }
            }
            break;

        case 'proxima_cita_historial':
            if (trimmedValue) {
                const nextAppointmentDate = new Date(trimmedValue);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Comparar solo la fecha
                if (isNaN(nextAppointmentDate.getTime())) {
                    message = 'Formato de fecha inválido para la próxima cita.';
                } else if (nextAppointmentDate < today) {
                    message = 'La próxima cita no puede ser en el pasado.';
                }
            }
            break;

        case 'nombre_servicio':
            if (!trimmedValue) {
                message = 'El nombre del servicio es requerido.';
            } else if (trimmedValue.length < 3 || trimmedValue.length > 100) {
                message = 'El nombre debe tener entre 3 y 100 caracteres.';
            }
            break;

        case 'descripcion_servicio':
            if (!trimmedValue) {
                message = 'La descripción del servicio es requerida.';
            } else if (trimmedValue.length < 10 || trimmedValue.length > 500) {
                message = 'La descripción debe tener entre 10 y 500 caracteres.';
            }
            break;

        case 'precio_servicio':
            if (!trimmedValue) {
                message = 'El precio del servicio es requerido.';
            } else {
                // Eliminar el símbolo de dólar si está presente para la validación numérica
                const numericValue = trimmedValue.replace(/^\$/, '');
                // Permitir números enteros o decimales con hasta 2 decimales
                if (!/^\d+(\.\d{1,2})?$/.test(numericValue)) {
                    message = 'Formato de precio inválido (ej. 50.00 o 50000).';
                } else {
                    const price = parseFloat(numericValue);
                    if (isNaN(price) || price <= 0 || price > 9999999.99) { // Rango de precios razonable
                        message = 'El precio debe ser un número positivo y no exceder 9,999,999.99.';
                    }
                }
            }
            break;

        default:
            // No validation for this field or it's handled by other means
            break;
    }
    return message;
};