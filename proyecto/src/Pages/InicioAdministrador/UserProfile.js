import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCog, FaEdit, FaSave, FaTimes, FaLock, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaSpinner, FaInfoCircle, FaBriefcase, FaGraduationCap, FaClock, FaCamera } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Styles/AdminProfile.css';

function AdminProfile({ user, setUser }) {
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [currentAdminData, setCurrentAdminData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Estados para la subida de imagen
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null); // Referencia para el input de archivo

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    /**
     * Muestra una notificación temporal en la UI.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de notificación ('success' o 'error').
     */
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    /**
     * Función mejorada para realizar peticiones fetch con autenticación JWT.
     * @param {string} endpoint - El endpoint de la API relativo.
     * @param {object} options - Opciones para la petición fetch.
     * @returns {Promise<object>} Los datos de la respuesta JSON.
     * @throws {Error} Si no se encontró el token o la respuesta de la red no es OK.
     */
    const authFetch = useCallback(async (endpoint, options = {}) => {
        const token = getAuthToken();
        if (!token) {
            showNotification('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.', 'error');
            throw new Error('No se encontró token de autenticación.');
        }

        const defaultHeaders = {
            'Authorization': `Bearer ${token}`
        };

        // Si el body es FormData, no establecer Content-Type, el navegador lo hará automáticamente
        if (!(options.body instanceof FormData)) {
            defaultHeaders['Content-Type'] = 'application/json';
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        // Si el body no es FormData y es un objeto, stringify
        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        console.log(`AuthFetch: Realizando solicitud a: http://localhost:5000${endpoint}`);
        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
                showNotification(`Error de API: ${errorMessage}`, 'error');
                throw new Error(errorMessage);
            }
            return response.json();
        } catch (err) {
            console.error("Error in authFetch:", err);
            throw err;
        }
    }, [showNotification]);

    /**
     * Función para subir una imagen a Cloudinary.
     * @param {File} file - El archivo de imagen a subir.
     * @returns {Promise<string>} La URL segura de la imagen subida.
     * @throws {Error} Si la subida falla.
     */
    const handleImageUpload = useCallback(async (file) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await authFetch('/upload-image', {
                method: 'POST',
                body: formData,
                // No Content-Type header needed for FormData; browser sets it
                headers: {} // Override default Content-Type if it was set
            });

            if (response.success && response.imageUrl) {
                showNotification('Imagen subida correctamente.', 'success');
                return response.imageUrl;
            } else {
                throw new Error(response.message || 'Error desconocido al subir la imagen.');
            }
        } catch (err) {
            console.error("Error al subir la imagen:", err);
            showNotification(`Error al subir la imagen: ${err.message}`, 'error');
            throw err;
        } finally {
            setIsUploading(false);
        }
    }, [authFetch, showNotification]);

    /**
     * Función de validación EXTREMADAMENTE EXHAUSTIVA para los campos del formulario de perfil.
     * Retorna un mensaje de error si el campo no es válido, o una cadena vacía si es válido.
     * @param {string} name - Nombre del campo a validar.
     * @param {string} value - Valor actual del campo.
     * @returns {string} Mensaje de error.
     */
    const validateField = useCallback((name, value) => {
        let message = '';
        const trimmedValue = value ? String(value).trim() : ''; // Asegurar que value sea string para trim

        // --- Patrones y listas de palabras clave para validaciones generales y de seguridad ---
        const commonSpecialChars = /[!@#$%^&*()_+\-=[{};':"\\|,.<>/?~`€£¥§°¶™®©₽₹¢\p{Emoji}]/u;
        const sqlInjectionKeywords = /(union\s+select|select\s+from|drop\s+table|insert\s+into|delete\s+from|alter\s+table|--|;|xp_cmdshell|exec\s+\(|sleep\(|benchmark\()/i;
        const xssKeywords = /(<script|javascript:|onmouseover|onerror|onload|onclick|alert\(|prompt\(|confirm\(|<iframe|<img|<svg|<body|<div|<style)/i;
        const commonBadWords = ['sexo', 'puta', 'mierda', 'nazi', 'fuck', 'shit', 'asshole', 'bitch', 'joder']; // Ejemplos, ampliar según necesidad
        const repetitivePattern = /(.)\1{4,}/; // Más de 4 caracteres idénticos consecutivos
        const sequentialPattern = /(?:01234|12345|233456|34567|45678|56789|7890|9876|8765|7654|6543|5432|4321|3210)/; // Secuencias numéricas
        const keyboardSequencesRegex = new RegExp( // Reconstrucción de la regex para evitar errores
            [
                "qwer", "wert", "erty", "rtyu", "tyui", "yuio", "uiop",
                "asdf", "sdfg", "dfgh", "fghj", "ghjk", "hjkl",
                "zxcv", "xcvb", "cvbn", "vbnm",
                "1qaz", "2wsx", "3edc", "4rfv", "5tgb", "6yhn", "7ujm", "8ik\\,", "9ol\\.", "0p\\;", // Vertical and diagonal numerical/alpha
                "qaz", "wsx", "edc", "rfv", "tgb", "yhn", "ujm", // Vertical alphabetical
                // Caracteres especiales que necesitan ser escapados en una regex construida con un string
                "\\,\\.i", // comma, dot, i
                "\\/po", // slash, p, o
                "\\/\\?", // slash, question mark
                "\\.;" // dot, semicolon
            ].join("|"),
            "i"
        );

        // --- Validaciones de seguridad y generales aplicables a casi todos los campos de texto ---
        if (trimmedValue.length > 0) { // Solo si el campo no está vacío
            if (sqlInjectionKeywords.test(trimmedValue)) {
                return `Contenido sospechoso de inyección SQL detectado. Evite caracteres y comandos inusuales.`;
            }
            if (xssKeywords.test(trimmedValue)) {
                return `Contenido sospechoso de ataque XSS detectado. No utilice etiquetas HTML, JavaScript o atributos de evento.`;
            }
            if (/\s\s\s+|\t|\n|\r/.test(value)) { // Múltiples espacios, tabs, saltos de línea
                return `El campo no debe contener múltiples espacios consecutivos, tabs o saltos de línea.`;
            }
            if (repetitivePattern.test(trimmedValue)) {
                return `El campo no debe contener más de 4 caracteres idénticos consecutivos.`;
            }
            if (sequentialPattern.test(trimmedValue)) {
                return `El campo contiene secuencias numéricas o alfabéticas muy comunes.`;
            }
            if (commonBadWords.some(word => trimmedValue.toLowerCase().includes(word))) {
                return `El campo contiene contenido inapropiado o no permitido.`;
            }
            if (/(test|demo|example|placeholder|temp|prueba|admin|root|qwerty|password|usuario|contrasena|admin123|admintest|admindemo|nombreapellido|correo@email\.com)/i.test(trimmedValue)) {
                return `El valor en este campo es un término genérico o de prueba. Por favor, use un valor real.`;
            }
            if (keyboardSequencesRegex.test(trimmedValue)) {
                return `El campo contiene secuencias comunes de teclado (horizontales, verticales, diagonales) o patrones de símbolos predecibles.`;
            }
        }


        switch (name) {
            case 'nombre':
            case 'apellido':
                // Validación: Campo requerido para nombre, opcional para apellido
                if (name === 'nombre' && !trimmedValue) {
                    message = 'El Nombre es obligatorio y no puede estar vacío.';
                }
                // Validación: Longitud mínima y máxima (estricta)
                else if (trimmedValue.length < 3) {
                    message = `${name === 'nombre' ? 'El nombre' : 'El apellido'} debe tener al menos 3 caracteres.`;
                }
                else if (trimmedValue.length > 40) {
                    message = `${name === 'nombre' ? 'El nombre' : 'El apellido'} no debe exceder los 40 caracteres.`;
                }
                // Validación: Solo letras, espacios, guiones, apóstrofes y caracteres acentuados. Prohibe otros símbolos.
                else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ'\s-]{3,40}$/.test(trimmedValue)) {
                    message = `Solo se permiten letras, espacios, guiones, apóstrofes y caracteres acentuados en ${name === 'nombre' ? 'el nombre' : 'el apellido'}. Evite números y otros símbolos.`;
                }
                // Validación: No permitir números (más explícito)
                else if (/\d/.test(trimmedValue)) {
                    message = `${name === 'nombre' ? 'El nombre' : 'El apellido'} no debe contener dígitos numéricos.`;
                }
                // Validación: No permitir emojis o símbolos Unicode complejos
                else if (/\p{Emoji_Modifier_Base}|\p{Emoji_Component}|\p{Emoji_Presentation}/u.test(trimmedValue) || commonSpecialChars.test(trimmedValue)) {
                    message = `El campo ${name} no debe contener emojis o símbolos especiales no permitidos.`;
                }
                // Validación: No espacios o guiones al inicio/final del valor (incluso después del trim, es una verificación adicional de lógica)
                else if (value.startsWith(' ') || value.endsWith(' ') || value.startsWith('-') || value.endsWith('-') || value.startsWith("'") || value.endsWith("'")) {
                    message = `${name === 'nombre' ? 'El nombre' : 'el apellido'} no debe iniciar o terminar con espacios, guiones o apóstrofes.`;
                }
                // Validación: No guiones o apóstrofes consecutivos (ej. '--', '''')
                else if (/--|''/.test(trimmedValue)) {
                    message = `${name === 'nombre' ? 'El nombre' : 'el apellido'} no debe tener guiones o apóstrofes consecutivos.`;
                }
                // Validación: Primera letra de cada palabra en mayúscula (se refuerza la sugerencia de formato)
                else if (!/^(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ']*\s?)+$/.test(trimmedValue.replace(/-/g, ' '))) {
                    message = `La primera letra de cada palabra en ${name === 'nombre' ? 'el nombre' : 'el apellido'} debe ser mayúscula (ej. 'Juan Pérez').`;
                }
                // Validación: Nombres o apellidos compuestos muy cortos sin sentido
                else if (trimmedValue.includes(' ') && trimmedValue.split(' ').some(part => part.length < 2)) {
                    message = `Si usa un nombre compuesto, cada parte debe tener al menos 2 caracteres.`;
                }
                // Validación: No nombres o apellidos que consistan únicamente en iniciales si son muy cortos
                else if (trimmedValue.length < 5 && /^[A-Z](?:\.[A-Z]\.)*$/.test(trimmedValue)) {
                    message = `Por favor, proporcione el ${name === 'nombre' ? 'nombre' : 'apellido'} completo, no solo iniciales.`;
                }
                break;

            case 'telefono':
                // Validación: Campo requerido
                if (!trimmedValue) {
                    message = 'El Teléfono es obligatorio y no puede estar vacío.';
                }
                // Validación: Longitud mínima y máxima (ajustado para números reales y prefijos)
                else if (trimmedValue.length < 7 || trimmedValue.length > 15) { // Mín 7 para fijos, Máx 15 para internacional +10 dígitos
                    message = 'El teléfono debe tener entre 7 y 15 dígitos (incluyendo prefijo internacional si aplica).';
                }
                // Validación: Solo dígitos y opcionalmente el '+' al inicio. Prohíbe cualquier otro símbolo o letra.
                else if (!/^(\+)?\d+$/.test(trimmedValue)) {
                    message = 'El teléfono solo debe contener números y opcionalmente el signo "+" al inicio. No se permiten letras, espacios ni otros caracteres.';
                }
                // Validación: No puede iniciar con 0 o 1 (para números de 10 dígitos nacionales en Colombia y muchos otros países)
                else if (trimmedValue.length >= 10 && !trimmedValue.startsWith('+') && (trimmedValue.startsWith('0') || trimmedValue.startsWith('1'))) {
                    message = 'Los números de teléfono nacionales válidos no deben iniciar con 0 ni 1.';
                }
                // Validación: Prefijos de móvil y fijo de Colombia específicos y completos
                else if (!trimmedValue.startsWith('+') && trimmedValue.length === 10) {
                    const mobilePrefixes = /^(300|301|302|304|305|310|311|312|313|314|315|316|317|318|319|320|321|322|323|324|325|350|351)/;
                    const landlinePrefixes = /^(601|602|604|605|606|607|608|609)/; // Bogotá, Cali, Medellín, etc.

                    const isMobile = mobilePrefixes.test(trimmedValue);
                    const isLandline = landlinePrefixes.test(trimmedValue);

                    if (!isMobile && !isLandline) {
                        message = 'El número de 10 dígitos no corresponde a un prefijo móvil o fijo válido en Colombia.';
                    }
                    if (isLandline && !/^60[1-9]\d{7}$/.test(trimmedValue)) {
                         message = 'Formato de número fijo de 10 dígitos (ej. 601xxxxxxx) no válido.';
                    }
                }
                // Validación: Prefijo internacional +57 para Colombia (si se usa prefijo y es de 13 dígitos)
                else if (trimmedValue.startsWith('+') && !trimmedValue.startsWith('+57') && trimmedValue.length === 13) {
                    message = 'Para números de 13 dígitos (ej. +573XXXXXXXXX), se espera el prefijo +57 para Colombia.';
                }
                // Validación: No permitir más de 4 dígitos idénticos consecutivos
                else if (/(.)\1{4,}/.test(trimmedValue)) {
                    message = 'El teléfono no puede contener más de 4 dígitos idénticos consecutivos.';
                }
                // Validación: No secuencias numéricas simples (ej. 12345, 98765)
                else if (sequentialPattern.test(trimmedValue)) {
                    message = 'El teléfono no puede ser una secuencia numérica simple.';
                }
                // Validación: Evitar números de emergencia o de servicio conocidos (expandido)
                else if (/^(112|123|195|119|156|164|192|911|999|111|000|060|061|062)/.test(trimmedValue)) {
                    message = 'Este número corresponde a un servicio de emergencia/asistencia y no es válido para registro.';
                }
                // Validación: No números que parezcan de fax, tarificación adicional o de prueba
                else if (/^900\d{6}|^800\d{6}|555\d{7}/.test(trimmedValue)) {
                    message = 'Este tipo de número de teléfono no está permitido (ej. números de tarificación especial o de prueba).';
                }
                // Validación: No números incompletos de prefijos conocidos (si son muy cortos y coinciden con un prefijo)
                else if (trimmedValue.length < 10 && (trimmedValue.match(/^(3|60)/) && trimmedValue.length > 2)) {
                    message = 'El número de teléfono parece incompleto. Por favor, ingrese el número completo.';
                }
                // Validación: No números con patrones muy obvios de repetición o simetría
                else if (/(\d{3})\1{1,}/.test(trimmedValue) && trimmedValue.length > 6) { // Ej. 123123, 4564567
                    message = 'El número de teléfono contiene patrones repetitivos obvios.';
                }
                break;

            case 'direccion':
                // Validación: Campo opcional, solo validar si hay valor
                if (trimmedValue) {
                    // Validación: Longitud mínima y máxima
                    if (trimmedValue.length < 20) {
                        message = 'La dirección debe tener al menos 20 caracteres para ser suficientemente detallada.';
                    } else if (trimmedValue.length > 200) {
                        message = 'La dirección no debe exceder los 200 caracteres.';
                    }
                    // Validación: Debe contener letras, números y al menos un símbolo de dirección clave
                    else if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmedValue) || !/\d/.test(trimmedValue) || !/[#\-.,]/.test(trimmedValue)) {
                        message = 'La dirección debe contener tanto letras, números, como al menos un "#", un "-" o un "," para ser válida.';
                    }
                    // Validación: Formato de dirección común en Colombia (tipo de vía, número, #, número de puerta/apartamento)
                    else if (!/(?:(?:calle|carrera|avenida|transversal|diagonal|circular|kilometro|cll|cra|av|tv|dg|kr|km)\s+\d+(?:[a-zA-Z]?)\s*#\s*\d+[a-zA-Z]?(?:\s*-\s*\d+[a-zA-Z]?)?(?:\s+apt\.|casa|of\.|lote|interior)?\s*\d*[a-zA-Z]?)/i.test(trimmedValue)) {
                        message = 'Formato de dirección inválido. Se espera algo como "Calle 123 # 45 - 67" o "Carrera 8A # 120-15 Apartamento 301".';
                    }
                    // Validación: Caracteres permitidos (letras, números, espacios, #, -, ., ,, y paréntesis para detalles de conjunto/apartamento)
                    else if (!/^[a-zA-Z0-9\s#\-.,()áéíóúÁÉÍÓÚñÑ]+$/.test(trimmedValue)) {
                        message = 'La dirección contiene caracteres especiales no permitidos. Usa solo letras, números, #, -, ., ,, y paréntesis.';
                    }
                    // Validación: No espacios al inicio o al final (incluso después del trim)
                    else if (value.startsWith(' ') || value.endsWith(' ')) {
                        message = 'La dirección no debe iniciar o terminar con espacios.';
                    }
                    // Validación: No múltiples espacios consecutivos (más estricto)
                    else if (/\s{2,}/.test(trimmedValue)) {
                        message = 'La dirección no debe contener múltiples espacios consecutivos.';
                    }
                    // Validación: No puntos, guiones o comas al inicio o al final de la dirección, ni consecutivos
                    else if (/[.,-]\s*$|^\s*[.,-]|[.,-]{2,}/.test(trimmedValue)) {
                        message = 'Formato incorrecto de puntos, comas o guiones (ej. no al inicio/final o consecutivos).';
                    }
                    // Validación: No direcciones con solo números o solo letras (deben ser combinadas y estructuradas)
                    else if (/^\d+$/.test(trimmedValue) || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmedValue.replace(/[#,.-]/g, ''))) {
                        message = 'La dirección debe ser una combinación estructurada de números, letras y símbolos de dirección.';
                    }
                    // Detección de direcciones genéricas o incompletas (expandida)
                    else if (/(n\.a|no\s*aplica|sin\s*direccion|desconocida|calle\s*$|carrera\s*$|avenida\s*$|cll\s*$|cra\s*$|av\s*$|tv\s*$|dg\s*$|kr\s*$|km\s*$|principal|central|carrera\s*principal|zona\s*urbana|rural)/i.test(trimmedValue.toLowerCase())) {
                         message = 'Por favor, proporciona una dirección más específica y completa, evitando términos genéricos o incompletos.';
                    }
                    // Validación: Números de vía y de edificio/apartamento razonables
                    const streetNumberMatch = trimmedValue.match(/(?:calle|carrera|cll|cra|av|tv|dg|kr|km)\s+(\d+)/i);
                    const buildingNumberMatch = trimmedValue.match(/#\s*(\d+)/);
                    if (streetNumberMatch && (parseInt(streetNumberMatch[1]) === 0 || parseInt(streetNumberMatch[1]) > 500)) {
                        message = 'El número de vía (calle/carrera) parece irreal o excesivamente alto. Verifique la dirección.';
                    }
                     if (buildingNumberMatch && (parseInt(buildingNumberMatch[1]) === 0 || parseInt(buildingNumberMatch[1]) > 999)) {
                        message = 'El número de la puerta o edificio (#) parece irreal o excesivamente alto. Verifique la dirección.';
                    }
                    // Validación: No números de 3 dígitos consecutivos que parezcan spam en partes numéricas (ej. 111, 222, 333)
                    else if (/\d{3}\s*\d{3}|\d{3}[a-zA-Z]\d{3}/.test(trimmedValue) && /(111|222|333|444|555|666|777|888|999|000)/.test(trimmedValue.match(/\d+/g) || [])) {
                        message = 'La dirección contiene secuencias numéricas repetidas o sospechosas.';
                    }
                    // Validación: Presencia de palabras clave que indiquen que no es una dirección física
                    else if (/(apartado\s*aereo|casillero|buzon\s*de\s*correo|p\.o\.\s*box|virtual|digital|ubicacion\s*gps|coordenadas)/i.test(trimmedValue)) {
                        message = 'No se permiten direcciones de apartados postales, casilleros o ubicaciones no físicas.';
                    }
                    // Validación: Ausencia de componentes clave si es una dirección compleja
                    const hasStreetType = /(calle|carrera|avenida|transversal|diagonal|cll|cra|av|tv|dg|kr|km)/i.test(trimmedValue);
                    const hasStreetNumberMatch = trimmedValue.match(/(?:calle|carrera|cll|cra|av|tv|dg|kr|km)\s+(\d+)/i);
                    const hasStreetNumber = hasStreetNumberMatch !== null && hasStreetNumberMatch[1] !== undefined;

                    const hasHashAndNumber = /#\s*\d+/.test(trimmedValue);
                    const hasHyphenAndNumber = /-\s*\d+/.test(trimmedValue);

                    if (trimmedValue.includes('Apartamento') && !hasHyphenAndNumber) {
                        message = 'Si especifica "Apartamento", debe seguir el formato "Calle # - Número Apartamento".';
                    }
                    if (!hasStreetType || !hasStreetNumber || !hasHashAndNumber) {
                         message = 'La dirección debe incluir al menos un tipo de vía (Calle, Carrera, Av, etc.), un número de vía y un número de casa/edificio.';
                    }
                }
                break;
            case 'experiencia':
                if (user.role === 'admin' || user.role === 'veterinario') {
                    if (!trimmedValue) {
                        message = 'La experiencia es obligatoria para su rol.';
                    } else if (trimmedValue.length < 5 || trimmedValue.length > 30) {
                        message = 'La experiencia debe tener entre 5 y 30 caracteres.';
                    } else if (!/^\d+(\+)?\s*(AÑOS|AÑOS\+)?$/i.test(trimmedValue)) {
                        message = 'Formato de experiencia inválido. Use "X AÑOS" o "X+ AÑOS" (ej. "5 AÑOS", "10+ AÑOS").';
                    }
                    // Aplicar también las validaciones generales de seguridad
                    if (sqlInjectionKeywords.test(trimmedValue) || xssKeywords.test(trimmedValue) ||
                        commonBadWords.some(word => trimmedValue.toLowerCase().includes(word)) ||
                        repetitivePattern.test(trimmedValue) || sequentialPattern.test(trimmedValue) ||
                        /(test|demo|example|placeholder|temp|prueba|admin|root|qwerty|password)/i.test(trimmedValue)) {
                        message = 'Contenido sospechoso detectado en el campo de experiencia.';
                    }
                }
                break;
            case 'universidad':
                if (user.role === 'admin' || user.role === 'veterinario') {
                    if (!trimmedValue) {
                        message = 'La universidad es obligatoria para su rol.';
                    } else if (trimmedValue.length < 5 || trimmedValue.length > 150) {
                        message = 'El nombre de la universidad debe tener entre 5 y 150 caracteres.';
                    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,&()-]+$/.test(trimmedValue)) {
                        message = 'El nombre de la universidad contiene caracteres no permitidos.';
                    }
                    // Aplicar también las validaciones generales de seguridad
                    if (sqlInjectionKeywords.test(trimmedValue) || xssKeywords.test(trimmedValue) ||
                        commonBadWords.some(word => trimmedValue.toLowerCase().includes(word)) ||
                        repetitivePattern.test(trimmedValue) || sequentialPattern.test(trimmedValue) ||
                        /(test|demo|example|placeholder|temp|prueba|admin|root|qwerty|password)/i.test(trimmedValue)) {
                        message = 'Contenido sospechoso detectado en el campo de universidad.';
                    }
                }
                break;
            case 'horario':
                if (user.role === 'admin' || user.role === 'veterinario') {
                    if (!trimmedValue) {
                        message = 'El horario es obligatorio para su rol.';
                    } else if (trimmedValue.length < 10 || trimmedValue.length > 255) {
                        message = 'El horario debe tener entre 10 y 255 caracteres.';
                    }
                    // Aplicar también las validaciones generales de seguridad
                    if (sqlInjectionKeywords.test(trimmedValue) || xssKeywords.test(trimmedValue) ||
                        commonBadWords.some(word => trimmedValue.toLowerCase().includes(word)) ||
                        repetitivePattern.test(trimmedValue) || sequentialPattern.test(trimmedValue) ||
                        /(test|demo|example|placeholder|temp|prueba|admin|root|qwerty|password)/i.test(trimmedValue)) {
                        message = 'Contenido sospechoso detectado en el campo de horario.';
                    }
                }
                break;
            default:
                break;
        }
        return message;
    }, [user.role]);


    /**
     * Carga los datos del perfil del administrador desde el backend.
     */
    const fetchAdminProfile = useCallback(async () => {
        if (!user || !user.id) {
            console.warn("AdminProfile: ID de administrador no disponible en el prop 'user'. No se cargará el perfil.");
            setError('ID de administrador no disponible para cargar el perfil.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch(`/usuarios/${user.id}`);
            console.log("AdminProfile: Datos recibidos del backend:", responseData); // *** LOG DE DEPURACIÓN ***

            if (responseData.success && responseData.data) {
                // Asegurarse de que todos los campos existan en el estado, incluso si son null o undefined de la BD
                setCurrentAdminData({
                    ...responseData.data,
                    experiencia: responseData.data.experiencia || '',
                    universidad: responseData.data.universidad || '',
                    horario: responseData.data.horario || '',
                    imagen_url: responseData.data.imagen_url || null, // Asegurar que imagen_url se carga
                });
                setPreviewImage(responseData.data.imagen_url || null); // Establecer la imagen de perfil existente como preview
            } else {
                setError(responseData.message || 'Formato de datos de perfil incorrecto recibido del servidor.');
                console.error("Error: Formato de datos de perfil incorrecto:", responseData);
            }
        } catch (err) {
            setError(`Error al cargar perfil: ${err.message}`);
            console.error('Error fetching admin profile:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user, authFetch, setError, setIsLoading]);

    useEffect(() => {
        if (user?.id) {
            fetchAdminProfile();
        }
    }, [user?.id, fetchAdminProfile]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setCurrentAdminData(prev => ({
            ...prev,
            [name]: value
        }));
        // Validar el campo en tiempo real
        const errorMessage = validateField(name, value);
        setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [validateField]);

    const handleInputBlur = useCallback((e) => {
        const { name, value } = e.target;
        // Validar el campo cuando pierde el foco
        const errorMessage = validateField(name, value);
        setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [validateField]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file)); // Crear URL para la vista previa
            setValidationErrors(prev => ({ ...prev, imagen_url: '' })); // Limpiar error si había
        } else {
            setSelectedFile(null);
            setPreviewImage(currentAdminData?.imagen_url || null); // Volver a la imagen original o null
        }
    };

    const handleSave = useCallback(async () => {
        if (!currentAdminData) {
            showNotification('No hay datos para guardar.', 'error');
            return;
        }

        // Realizar validación completa antes de enviar
        let errors = {};
        const fieldsToValidate = ['nombre', 'apellido', 'telefono', 'direccion'];
        if (user.role === 'admin' || user.role === 'veterinario') {
            fieldsToValidate.push('experiencia', 'universidad', 'horario');
        }

        fieldsToValidate.forEach(field => {
            const errorMessage = validateField(field, currentAdminData[field]);
            if (errorMessage) {
                errors[field] = errorMessage;
            }
        });

        setValidationErrors(errors);

        if (Object.keys(errors).some(key => errors[key])) { // Si hay *algún* error de validación
            showNotification('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            let newImageUrl = currentAdminData.imagen_url;

            // Paso 1: Subir la imagen si se seleccionó una nueva
            if (selectedFile) {
                try {
                    newImageUrl = await handleImageUpload(selectedFile);
                } catch (uploadError) {
                    // El error ya se maneja en handleImageUpload y showNotification
                    setIsSubmitting(false);
                    return; // Detener el proceso de guardado si la subida de imagen falla
                }
            }

            // Paso 2: Guardar los datos del perfil (incluyendo la nueva URL de la imagen)
            const dataToUpdate = {
                nombre: currentAdminData.nombre,
                apellido: currentAdminData.apellido,
                telefono: currentAdminData.telefono,
                direccion: currentAdminData.direccion,
                imagen_url: newImageUrl, // Usar la nueva URL o la existente
            };

            // Añadir campos específicos del rol si aplica
            if (user.role === 'admin' || user.role === 'veterinario') {
                dataToUpdate.experiencia = currentAdminData.experiencia;
                dataToUpdate.universidad = currentAdminData.universidad;
                dataToUpdate.horario = currentAdminData.horario;
            }

            console.log("AdminProfile: Datos enviados al backend:", dataToUpdate); // *** LOG DE DEPURACIÓN ***

            const responseData = await authFetch(`/usuarios/${currentAdminData.id}`, {
                method: 'PUT',
                body: dataToUpdate
            });

            if (responseData.success && responseData.data) {
                const updatedGlobalUser = {
                    ...user,
                    ...responseData.data
                };
                setUser(updatedGlobalUser);
                localStorage.setItem('user', JSON.stringify(updatedGlobalUser));

                setEditMode(false);
                setSelectedFile(null); // Limpiar el archivo seleccionado después de guardar
                // setPreviewImage(responseData.data.imagen_url || null); // Asegurar que la preview sea la imagen guardada
                showNotification('Perfil actualizado correctamente.');
            } else {
                showNotification(responseData.message || 'Error al actualizar perfil.', 'error');
            }
        } catch (error) {
            showNotification(`Error al actualizar perfil: ${error.message}`, 'error');
            console.error('Error updating admin profile:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [authFetch, currentAdminData, showNotification, setUser, user, setEditMode, setIsSubmitting, setError, validateField, selectedFile, handleImageUpload]);

    const handlePasswordChangeRedirect = useCallback(() => {
        navigate('/olvidar-contrasena');
    }, [navigate]);

    // Determinar la URL de la imagen a mostrar
    const displayImageUrl = previewImage || currentAdminData?.imagen_url || `https://placehold.co/150x150/00acc1/ffffff?text=${user?.nombre?.charAt(0) || 'A'}`;

    if (isLoading) {
        return (
            <div className="admin-profile-container loading-state">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                    <p>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-profile-container error-state">
                <div className="error-message">
                    <FaInfoCircle className="info-icon" />
                    {error}
                </div>
            </div>
        );
    }

    if (!currentAdminData) {
        return (
            <div className="admin-profile-container no-data-state">
                <div className="info-message">
                    <FaInfoCircle className="info-icon" />
                    <p>No se pudo cargar la información del perfil del administrador.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-profile-container">
            {/* Notificaciones con AnimatePresence para animaciones de entrada/salida */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        key="admin-profile-notification" // Clave única para AnimatePresence
                        className={`notification ${notification.type}`}
                        initial={{ opacity: 0, y: -20, pointerEvents: 'none' }} // Comienza invisible y ligeramente arriba, no interactivo
                        animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }} // Anima a visible, posición normal, interactivo
                        exit={{ opacity: 0, y: -20, pointerEvents: 'none' }} // Anima a invisible y ligeramente arriba al salir, no interactivo
                        transition={{ duration: 0.3 }} // Duración de la transición
                    >
                        <FaInfoCircle className="notification-icon" />
                        {notification.message}
                        <button className="close-notification" onClick={() => setNotification(null)}>
                            <FaTimes />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="admin-content-header">
                <h2>
                    <FaUserCog className="header-icon" />
                    Mi Perfil de {user.role === 'admin' ? 'Administrador' : 'Veterinario'}
                </h2>
            </div>

            <div className="profile-card">
                <div className="profile-section">
                    <div className="section-header">
                        <h3>Información Personal</h3>
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="edit-btn"
                                disabled={isSubmitting || isUploading}
                            >
                                <FaEdit /> Editar
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setEditMode(false);
                                    setValidationErrors({});
                                    setSelectedFile(null); // Limpiar archivo seleccionado
                                    setPreviewImage(currentAdminData?.imagen_url || null); // Restaurar preview a la imagen original
                                    fetchAdminProfile(); // Recargar datos originales al cancelar para descartar cambios
                                }}
                                className="cancel-btn"
                                disabled={isSubmitting || isUploading}
                            >
                                <FaTimes /> Cancelar
                            </button>
                        )}
                    </div>

                    {/* Sección de Imagen de Perfil */}
                    <div className="profile-image-upload-section">
                        <div className="profile-image-container">
                            <img
                                src={displayImageUrl}
                                alt="Foto de Perfil"
                                className="profile-image"
                                onError={(e) => {
                                    e.target.onerror = null; // Evita bucles infinitos de error
                                    e.target.src = `https://placehold.co/150x150/00acc1/ffffff?text=${user?.nombre?.charAt(0) || 'A'}`;
                                }}
                            />
                            {editMode && (
                                <motion.button
                                    className="upload-overlay-button"
                                    onClick={() => fileInputRef.current.click()}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    disabled={isSubmitting || isUploading}
                                >
                                    {isUploading ? <FaSpinner className="spinner-icon" /> : <FaCamera />}
                                </motion.button>
                            )}
                        </div>
                        {editMode && (
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }} // Ocultar el input de archivo nativo
                                accept="image/*"
                                disabled={isSubmitting || isUploading}
                            />
                        )}
                        {editMode && !selectedFile && (
                             <p className="upload-help-text">Haz clic en el icono de la cámara para cambiar tu foto de perfil.</p>
                        )}
                        {selectedFile && (
                            <p className="selected-file-name">Archivo seleccionado: {selectedFile.name}</p>
                        )}
                    </div>


                    {editMode ? (
                        <div className="edit-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={currentAdminData.nombre || ''}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur}
                                        placeholder="Tu nombre"
                                        disabled={isSubmitting || isUploading}
                                        required
                                    />
                                    {validationErrors.nombre && <span className="error-message-inline">{validationErrors.nombre}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="apellido">Apellido</label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        name="apellido"
                                        value={currentAdminData.apellido || ''}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur}
                                        placeholder="Tu apellido"
                                        disabled={isSubmitting || isUploading}
                                    />
                                    {validationErrors.apellido && <span className="error-message-inline">{validationErrors.apellido}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Email</label>
                                    <div className="disabled-input">
                                        {currentAdminData.email}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="telefono">Teléfono</label>
                                    <input
                                        type="text"
                                        id="telefono"
                                        name="telefono"
                                        value={currentAdminData.telefono || ''}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur}
                                        placeholder="Tu teléfono"
                                        disabled={isSubmitting || isUploading}
                                        required
                                    />
                                    {validationErrors.telefono && <span className="error-message-inline">{validationErrors.telefono}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="direccion">Dirección</label>
                                    <input
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        value={currentAdminData.direccion || ''}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur}
                                        placeholder="Tu dirección"
                                        disabled={isSubmitting || isUploading}
                                    />
                                    {validationErrors.direccion && <span className="error-message-inline">{validationErrors.direccion}</span>}
                                </div>

                                {/* Campos adicionales para roles 'admin' y 'veterinario' */}
                                {(user.role === 'admin' || user.role === 'veterinario') && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="experiencia">Experiencia (ej. "5 AÑOS")</label>
                                            <input
                                                type="text"
                                                id="experiencia"
                                                name="experiencia"
                                                value={currentAdminData.experiencia || ''}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                placeholder="Ej: 5 AÑOS o 10+ AÑOS"
                                                disabled={isSubmitting || isUploading}
                                                required
                                            />
                                            {validationErrors.experiencia && <span className="error-message-inline">{validationErrors.experiencia}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="universidad">Universidad</label>
                                            <input
                                                type="text"
                                                id="universidad"
                                                name="universidad"
                                                value={currentAdminData.universidad || ''}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                placeholder="Ej: Universidad Nacional de Colombia"
                                                disabled={isSubmitting || isUploading}
                                                required
                                            />
                                            {validationErrors.universidad && <span className="error-message-inline">{validationErrors.universidad}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="horario">Horario</label>
                                            <input
                                                type="text"
                                                id="horario"
                                                name="horario"
                                                value={currentAdminData.horario || ''}
                                                onChange={handleInputChange}
                                                onBlur={handleInputBlur}
                                                placeholder="Ej: LUNES A VIERNES: 8:00 AM - 5:00 PM"
                                                disabled={isSubmitting || isUploading}
                                                required
                                            />
                                            {validationErrors.horario && <span className="error-message-inline">{validationErrors.horario}</span>}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="save-btn"
                                    disabled={isSubmitting || isUploading || Object.keys(validationErrors).some(key => validationErrors[key])}
                                >
                                    {isSubmitting || isUploading ? <><FaSpinner className="spinner-icon" /> Guardando...</> : <><FaSave /> Guardar Cambios</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-info">
                            <div className="info-item">
                                <FaUser className="info-icon" />
                                <div>
                                    <span className="info-label">Nombre completo</span>
                                    <span className="info-value">{currentAdminData.nombre} {currentAdminData.apellido}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaEnvelope className="info-icon" />
                                <div>
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{currentAdminData.email}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaPhone className="info-icon" />
                                <div>
                                    <span className="info-label">Teléfono</span>
                                    <span className="info-value">{currentAdminData.telefono || 'No especificado'}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaMapMarkerAlt className="info-icon" />
                                <div>
                                    <span className="info-label">Dirección</span>
                                    <span className="info-value">{currentAdminData.direccion || 'No especificada'}</span>
                                </div>
                            </div>

                            <div className="info-item">
                                <FaShieldAlt className="info-icon" />
                                <div>
                                    <span className="info-label">Rol</span>
                                    <span className="info-value">{currentAdminData.role || 'Administrador'}</span>
                                </div>
                            </div>

                            {/* Mostrar campos adicionales si el rol es 'admin' o 'veterinario' */}
                            {(user.role === 'admin' || user.role === 'veterinario') && (
                                <>
                                    <div className="info-item">
                                        <FaBriefcase className="info-icon" />
                                        <div>
                                            <span className="info-label">Experiencia</span>
                                            <span className="info-value">{currentAdminData.experiencia || 'No especificada'}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <FaGraduationCap className="info-icon" />
                                        <div>
                                            <span className="info-label">Universidad</span>
                                            <span className="info-value">{currentAdminData.universidad || 'No especificada'}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <FaClock className="info-icon" />
                                        <div>
                                            <span className="info-label">Horario</span>
                                            <span className="info-value">{currentAdminData.horario || 'No especificado'}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;
