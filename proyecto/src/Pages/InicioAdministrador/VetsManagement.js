import React, { useState, useEffect, useCallback } from 'react';
// Importa los iconos de Font Awesome para una mejor interfaz de usuario
import { FaUserMd, FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaSave, FaSpinner, FaInfoCircle, FaCheck, FaBan, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Styles/AdminStyles.css';
import { authFetch } from './api';

/**
 * Componente VetsManagement
 * Gestiona la visualización, adición, edición, activación/desactivación y eliminación de veterinarios.
 */
function VetsManagement() {
    // --- Estados del componente ---
    const [vets, setVets] = useState([]);
    const [filteredVets, setFilteredVets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState(null);

    // Estados para el modal de Añadir/Editar Veterinario
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentVet, setCurrentVet] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        password: '',
        confirmPassword: ''
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Muestra una notificación temporal en la interfaz de usuario.
     * @param {string} message - El mensaje a mostrar en la notificación.
     * @param {string} type - El tipo de notificación ('success' o 'error'), para aplicar estilos.
     */
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }, []);

    /**
     * Función asíncrona para cargar la lista de veterinarios desde el backend.
     */
    const fetchVets = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/usuarios/veterinarios');
            if (responseData.success && Array.isArray(responseData.data)) {
                setVets(responseData.data.map(vet => ({
                    ...vet,
                    status: vet.active ? 'active' : 'inactive'
                })));
            } else {
                setError(responseData.message || 'Formato de datos de veterinarios incorrecto.');
                showNotification(responseData.message || 'Error al cargar veterinarios: Formato de datos incorrecto.', 'error');
            }
        } catch (err) {
            setError(`Error al cargar veterinarios: ${err.message}`);
            console.error('Error fetching vets:', err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, showNotification, setError, setIsLoading]);

    // Carga inicial de veterinarios
    useEffect(() => {
        fetchVets();
    }, [fetchVets]);

    // Filtrado de veterinarios basado en término de búsqueda y estado
    useEffect(() => {
        let results = vets.filter(vet =>
            vet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (vet.apellido && vet.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
            vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vet.telefono.includes(searchTerm) ||
            (vet.direccion && vet.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filterStatus === 'active') {
            results = results.filter(vet => vet.active);
        } else if (filterStatus === 'inactive') {
            results = results.filter(vet => !vet.active);
        }

        setFilteredVets(results);
    }, [searchTerm, vets, filterStatus]);

    /**
     * Función de validación EXTREMADAMENTE EXHAUSTIVA para cada campo del formulario.
     * Retorna un mensaje de error si el campo no es válido, o una cadena vacía si es válido.
     * @param {string} name - Nombre del campo a validar.
     * @param {string} value - Valor actual del campo.
     * @param {object} currentFormData - El estado completo del formulario para validaciones cruzadas.
     * @param {boolean} isNewVet - True si se está creando un nuevo veterinario, false si se edita.
     * @returns {string} Mensaje de error.
     */
    const validateField = useCallback((name, value, currentFormData = formData, isNewVet = !currentVet) => {
        let message = '';
        const trimmedValue = value.trim();

        // --- Patrones y listas de palabras clave para validaciones generales y de seguridad ---
        const commonSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`€£¥§°¶™®©₽₹¢\p{Emoji}]/u;
        const sqlInjectionKeywords = /(union\s+select|select\s+from|drop\s+table|insert\s+into|delete\s+from|alter\s+table|--|;|xp_cmdshell|exec\s+\(|sleep\(|benchmark\()/i;
        const xssKeywords = /(<script|javascript:|onmouseover|onerror|onload|onclick|alert\(|prompt\(|confirm\(|<iframe|<img|<svg|<body|<div|<style)/i;
        const commonBadWords = ['sexo', 'puta', 'mierda', 'nazi', 'fuck', 'shit', 'asshole', 'bitch', 'joder']; // Ejemplos, ampliar según necesidad
        const repetitivePattern = /(.)\1{4,}/; // Más de 4 caracteres idénticos consecutivos
        const sequentialPattern = /(?:01234|12345|23456|34567|45678|56789|7890|9876|8765|7654|6543|5432|4321|3210)/; // Secuencias numéricas
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
                return `Contenido sospechoso de inyección SQL detectado en ${name}. Por favor, evite caracteres y comandos inusuales.`;
            }
            if (xssKeywords.test(trimmedValue)) {
                return `Contenido sospechoso de ataque XSS detectado en ${name}. No utilice etiquetas HTML, JavaScript o atributos de evento.`;
            }
            if (/\s\s\s+|\t|\n|\r/.test(value)) { // Múltiples espacios, tabs, saltos de línea
                return `El campo ${name} no debe contener múltiples espacios consecutivos, tabs o saltos de línea.`;
            }
            if (repetitivePattern.test(trimmedValue)) {
                return `El campo ${name} no debe contener más de 4 caracteres idénticos consecutivos.`;
            }
            if (sequentialPattern.test(trimmedValue)) {
                return `El campo ${name} contiene secuencias numéricas o alfabéticas muy comunes.`;
            }
            if (commonBadWords.some(word => trimmedValue.toLowerCase().includes(word))) {
                return `El campo ${name} contiene contenido inapropiado o no permitido.`;
            }
            if (/(test|demo|example|placeholder|temp|prueba|admin|root|qwerty|password|usuario|contrasena|admin123|vettest|petdemo|nombreapellido|correo@email\.com)/i.test(trimmedValue)) {
                return `El valor en ${name} es un término genérico o de prueba. Por favor, use un valor real.`;
            }
            if (keyboardSequencesRegex.test(trimmedValue)) {
                return `El campo ${name} contiene secuencias comunes de teclado (horizontales, verticales, diagonales) o patrones de símbolos predecibles.`;
            }
        }


        switch (name) {
            case 'nombre':
            case 'apellido':
                // Validación: Campo requerido
                if (!trimmedValue) {
                    message = `${name === 'nombre' ? 'El Nombre' : 'El Apellido'} es obligatorio y no puede estar vacío.`;
                }
                // Validación: Longitud mínima (incrementado a 3 para nombres más significativos)
                else if (trimmedValue.length < 3) {
                    message = `${name === 'nombre' ? 'El nombre' : 'El apellido'} debe tener al menos 3 caracteres.`;
                }
                // Validación: Longitud máxima (reducido a 40 para evitar nombres excesivamente largos)
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

            case 'email':
                // Validación: Campo requerido
                if (!trimmedValue) {
                    message = 'El Email es obligatorio y no puede estar vacío.';
                }
                // Validación: Longitud mínima y máxima
                else if (trimmedValue.length < 6 || trimmedValue.length > 100) { // Un email muy largo suele ser sospechoso
                    message = 'El email debe tener entre 6 y 100 caracteres para ser válido.';
                }
                // Validación: Formato de email muy robusto (RFC 5322) y caracteres específicos
                else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(trimmedValue)) {
                    message = 'Formato de email inválido. Verifique la estructura, caracteres y dominio (ej. usuario@dominio.com).';
                }
                // Validación: No `@` al inicio o al final, ni múltiples `@`
                else if (trimmedValue.startsWith('@') || trimmedValue.endsWith('@') || (trimmedValue.match(/@/g) || []).length !== 1) {
                    message = 'El email debe contener un único "@" y no puede estar al inicio o al final.';
                }
                // Validación: No puntos consecutivos ni al inicio/final del nombre de usuario local o dominio
                else if (/\.{2,}/.test(trimmedValue) || trimmedValue.startsWith('.') || trimmedValue.split('@')[0].endsWith('.') || trimmedValue.split('@')[1].startsWith('.') || trimmedValue.endsWith('.')) {
                    message = 'El email no debe contener puntos consecutivos ni puntos al inicio/final de las partes del email.';
                }
                // Validación: No guiones al inicio/final del dominio o subdominio
                else if (/\.-|-\./.test(trimmedValue) || trimmedValue.split('@')[1].startsWith('-') || trimmedValue.split('@')[1].endsWith('-')) {
                    message = 'El dominio no debe iniciar o terminar con guiones, ni tener guiones adyacentes a puntos.';
                }
                // Validación: No caracteres especiales no permitidos en el nombre de usuario local (solo alfanuméricos y `!#$%&'*+\-/=?^_`{|}~.`)
                else if (!/^[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~.]+$/.test(trimmedValue.split('@')[0])) {
                    message = 'El nombre de usuario del email contiene caracteres no permitidos.';
                }
                // Validación: TLDs y dominios específicos
                else {
                    const domain = trimmedValue.split('@')[1];
                    const tld = domain.split('.').pop(); // Obtiene el último componente como TLD

                    const allowedTlds = [
                        'com', 'org', 'net', 'info', 'biz', 'co', 'io', 'dev', 'app', 'xyz', 'online', 'store', 'me',
                        'es', 'mx', 'ar', 'cl', 'pe', 've', 'ec', 'pa', 'uy', 'py', 'ca', 'us', 'uk', 'de', 'fr' // Más TLDs comunes
                    ];
                    if (!allowedTlds.includes(tld.toLowerCase()) || tld.length < 2 || tld.length > 6) {
                        message = `El TLD (.${tld}) no es válido o reconocido (ej. .com, .co, .org).`;
                    }

                    const commonProviders = [
                        'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'aol.com', 'icloud.com',
                        'protonmail.com', 'zoho.com', 'mail.com', 'live.com', 'yandex.com', 'gmx.com',
                        'veterinaria.com.co', 'flookypets.com', 'petcare.co', 'animalclinic.com',
                        'msn.com', 'terra.com.co', 'une.net.co', 'etb.net.co', 'telefonica.net', 'vodafone.es' // Más proveedores comunes
                    ];
                    const isSubdomainOfKnown = commonProviders.some(p => domain.endsWith(`.${p}`));
                    if (!commonProviders.includes(domain.toLowerCase()) && !isSubdomainOfKnown) {
                        message = 'Por favor, usa un dominio de email reconocido, de tu empresa o un TLD de país válido.';
                    }
                    // Detección de dominios temporales/desechables (expandida)
                    const disposableDomains = [
                        'mailinator.com', 'tempmail.com', 'grr.la', 'yopmail.com', '10minutemail.com', 'guerrillamail.com',
                        'sharklasers.com', 'getnada.com', 'trashmail.com', 'disposablemail.com', 'mohmal.com', 'dropmail.me',
                        'anonemail.net', 'bccto.me', 'chacuo.net', 'filzmail.com', 'fudgerub.com', 'maildrop.cc'
                    ];
                    if (disposableDomains.some(d => domain.includes(d))) {
                        message = 'No se permiten emails de dominios temporales o desechables para el registro.';
                    }
                    // Detección de alias de email comunes (ej. "usuario+alias@") - más estricto
                    if (trimmedValue.split('@')[0].includes('+') || /\balias\b|\btest\b|\bdemo\b|\buser\d*\b|\badmin\d*\b/i.test(trimmedValue.split('@')[0])) {
                        message = 'El nombre de usuario del email no debe contener alias (con "+") ni términos genéricos como "test" o "admin".';
                    }
                    // Nombre de usuario local debe tener al menos 2 caracteres
                    if (trimmedValue.split('@')[0].length < 2) {
                        message = 'El nombre de usuario del email es demasiado corto.';
                    }
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

                    const isMobile = mobilePrefixes.test(trimmedValue); // DECLARACIÓN Y ASIGNACIÓN
                    const isLandline = landlinePrefixes.test(trimmedValue); // DECLARACIÓN Y ASIGNACIÓN

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
                if (trimmedValue) { // Campo opcional, solo validar si hay valor
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
                    const hasStreetNumber = /\d+/.test(trimmedValue.match(/(?:calle|carrera|cll|cra|av|tv|dg|kr|km)\s+(\d+)/i));
                    const hasHashAndNumber = /#\s*\d+/.test(trimmedValue);
                    const hasHyphenAndNumber = /\-\s*\d+/.test(trimmedValue);

                    if (trimmedValue.includes('Apartamento') && !hasHyphenAndNumber) {
                        message = 'Si especifica "Apartamento", debe seguir el formato "Calle # - Número Apartamento".';
                    }
                    if (!hasStreetType || !hasStreetNumber || !hasHashAndNumber) {
                         message = 'La dirección debe incluir al menos un tipo de vía (Calle, Carrera, Av, etc.), un número de vía y un número de casa/edificio.';
                    }
                }
                break;

            case 'password':
                // Validación: Requerido para nuevos veterinarios, o si se intenta cambiar en edición
                if (isNewVet || (trimmedValue && trimmedValue.length > 0)) {
                    if (!trimmedValue) {
                        message = isNewVet ? 'La Contraseña es obligatoria y no puede estar vacía.' : 'La contraseña no puede estar vacía si se va a cambiar.';
                    }
                    // Validación: Longitud mínima (súper segura)
                    else if (trimmedValue.length < 16) {
                        message = 'Debe tener al menos 16 caracteres para una seguridad robusta (recomendado 20+).';
                    }
                    // Validación: Longitud máxima (controla el tamaño, evita DoS por contraseñas excesivas)
                    else if (trimmedValue.length > 128) {
                        message = 'La contraseña no debe exceder los 128 caracteres.';
                    }
                    // Validación: Al menos 3 mayúsculas
                    else if ((trimmedValue.match(/[A-ZÁÉÍÓÚÑ]/g) || []).length < 3) {
                        message = 'Debe contener al menos 3 letras mayúsculas.';
                    }
                    // Validación: Al menos 3 minúsculas
                    else if ((trimmedValue.match(/[a-záéíóúñ]/g) || []).length < 3) {
                        message = 'Debe contener al menos 3 letras minúsculas.';
                    }
                    // Validación: Al menos 3 números
                    else if ((trimmedValue.match(/[0-9]/g) || []).length < 3) {
                        message = 'Debe contener al menos 3 números (0-9).';
                    }
                    // Validación: Al menos 3 caracteres especiales diferentes de categorías diversas
                    else if (!/(?=.*[!@#$%^&*])(?=.*[()_+\-=\[\]{};':"\\|,.<>\/?~`])(?=.*[€£¥§°¶™®©₽₹¢])/u.test(trimmedValue)) { // Usar 'u' flag para \p{Emoji}
                        message = 'Debe contener al menos 3 caracteres especiales de diferentes tipos (ej. !, @, #, $, %, ^, &, *, (, ), _, +, -, =, [, ], {, }, ;, :, ", \\, |, ,, <, >, /, ?, ~, `, €, £, ¥, §, °, ¶, ™, ®, ©, ₽, ₹, ¢).';
                    }
                    // Validación: No espacios en la contraseña
                    else if (/\s/.test(trimmedValue)) {
                        message = 'La contraseña no debe contener ningún tipo de espacio en blanco.';
                    }
                    // Validación: No patrones comunes o secuencias predecibles (lista muy ampliada de patrones y palabras)
                    else if (/(123456|abcdef|password|qwerty|admin123|contraseña|vet1234|mascota12|flookypets|mypassword|changeme|secret123|testpass|111111|aaaaaa|000000|1a2b3c4d|passw0rd!|welcome2024|adminuser|userpass|supersecret|mynameis|myemailis|123go|iloveyou|dragon)/i.test(trimmedValue)) {
                        message = 'Es una contraseña demasiado común, predecible o fácilmente adivinable. Evite palabras de diccionario y secuencias simples.';
                    }
                    // Validación: No más de 2 caracteres repetidos consecutivamente
                    else if (/(.)\1\1/.test(trimmedValue)) {
                        message = 'La contraseña no debe contener más de 2 caracteres idénticos repetidos consecutivamente.';
                    }
                    // Validación: Evitar secuencias de teclado comunes (horizontales, verticales, diagonales - muy exhaustiva)
                    else if (keyboardSequencesRegex.test(trimmedValue)) {
                        message = 'Evita secuencias comunes de teclado (horizontales, verticales, diagonales) o patrones de símbolos predecibles.';
                    }
                    // Validación: No puede ser solo números, solo letras o solo símbolos
                    else if (/^[0-9]+$/.test(trimmedValue) || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/.test(trimmedValue) || /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`€£¥§°¶™®©₽₹¢]+$/u.test(trimmedValue)) {
                        message = 'La contraseña debe ser una combinación balanceada de letras (mayúsculas y minúsculas), números y símbolos.';
                    }
                    // Validación: Evitar partes del nombre, apellido o email (más robusto y limpieza de caracteres especiales/números de identificación)
                    else {
                        const cleanName = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const identifyingParts = [
                            cleanName(currentFormData.nombre),
                            cleanName(currentFormData.apellido),
                            currentFormData.email ? cleanName(currentFormData.email.split('@')[0]) : ''
                        ].filter(p => p.length > 3);

                        if (identifyingParts.some(part => trimmedValue.toLowerCase().includes(part) && trimmedValue.toLowerCase().length / part.length < 2)) {
                            message = 'La contraseña no debe contener partes reconocibles de su nombre, apellido o email si son demasiado obvias.';
                        }
                        // También evitar fechas de nacimiento comunes (DDMMYYYY, YYYYMMDD) o años comunes
                        const currentYear = new Date().getFullYear();
                        if (/\d{4}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])|(?:0[1-9]|1[0-2])\d{2}\d{4}|(19|20)\d{2}/.test(trimmedValue) ||
                            trimmedValue.includes(String(currentYear)) || trimmedValue.includes(String(currentYear - 1)) || trimmedValue.includes(String(currentYear + 1)) ||
                            trimmedValue.includes(String(currentYear + 10)) || trimmedValue.includes(String(currentYear - 10))) {
                            message = 'Evite usar fechas de nacimiento, años actuales/cercanos o secuencias numéricas de fecha como parte de su contraseña.';
                        }
                        // Detección de palíndromos simples (más allá de 5 caracteres)
                        const reversed = trimmedValue.split('').reverse().join('');
                        if (trimmedValue.length > 5 && trimmedValue.toLowerCase() === reversed.toLowerCase()) {
                            message = 'La contraseña es un palíndromo simple y podría ser fácil de adivinar.';
                        }

                        // Calcular una métrica de entropía más estricta para detectar debilidad
                        const charSets = {
                            lower: /[a-z]/g,
                            upper: /[A-Z]/g,
                            digits: /[0-9]/g,
                            symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`€£¥§°¶™®©₽₹¢]/gu // `u` flag needed for \p{Emoji}
                        };
                        let uniqueCharTypes = 0;
                        if (charSets.lower.test(trimmedValue)) uniqueCharTypes++;
                        if (charSets.upper.test(trimmedValue)) uniqueCharTypes++;
                        if (charSets.digits.test(trimmedValue)) uniqueCharTypes++;
                        if (charSets.symbols.test(trimmedValue)) uniqueCharTypes++;

                        let poolSize = 0;
                        if (uniqueCharTypes > 0) {
                            if (charSets.lower.test(trimmedValue)) poolSize += 26;
                            if (charSets.upper.test(trimmedValue)) poolSize += 26;
                            if (charSets.digits.test(trimmedValue)) poolSize += 10;
                            if (charSets.symbols.test(trimmedValue)) poolSize += 33; // Aprox. 33 símbolos comunes
                        } else {
                            poolSize = 1; // Fallback, though previous validations should prevent this
                        }
                        const entropy = trimmedValue.length * (Math.log2(poolSize));

                        if (entropy < 80) { // Umbral de entropía muy alto para contraseñas de alta seguridad
                            message = `La contraseña es predecible (${entropy.toFixed(0)} bits de entropía). Intenta usar una combinación más aleatoria y diversa de caracteres para mayor seguridad.`;
                        }
                    }
                }
                break;

            case 'confirmPassword':
                // Validación: Requerido si se está estableciendo o cambiando la contraseña principal
                if ((currentFormData.password && currentFormData.password.length > 0) || isNewVet) {
                    if (!trimmedValue) {
                        message = 'Por favor, confirma tu contraseña. Este campo es obligatorio.';
                    }
                    // Validación: Debe coincidir exactamente con la contraseña principal
                    else if (trimmedValue !== currentFormData.password) {
                        message = 'Las contraseñas no coinciden. Asegúrate de que sean exactamente iguales.';
                    }
                    // Validación: Longitud mínima (como la principal)
                    else if (trimmedValue.length < 16) {
                        message = 'La confirmación debe tener al menos 16 caracteres, igual que la contraseña principal.';
                    }
                    // Validación: Longitud máxima (como la principal)
                    else if (trimmedValue.length > 64) {
                        message = 'La confirmación no debe exceder los 64 caracteres.';
                    }
                }
                break;
            default:
                break;
        }
        return message;
    }, [currentVet, formData]);

    /**
     * Maneja los cambios en los campos del formulario y activa la validación en tiempo real.
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        const updatedFormData = { ...formData, [name]: value };
        const errorMessage = validateField(name, value, updatedFormData);
        setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));

        // Si es un campo de contraseña y se está escribiendo, valida también confirmPassword
        if (name === 'password' && updatedFormData.confirmPassword.length > 0) {
            const confirmPassError = validateField('confirmPassword', updatedFormData.confirmPassword, updatedFormData);
            setValidationErrors(prev => ({ ...prev, confirmPassword: confirmPassError }));
        }
    }, [formData, validateField]);

    /**
     * Maneja el evento onBlur (cuando un input pierde el foco) para activar la validación.
     */
    const handleInputBlur = useCallback((e) => {
        const { name, value, required } = e.target;
        // Valida si el campo es requerido y está vacío, o si tiene un valor no vacío.
        if (value.trim() !== '' || required) {
            const errorMessage = validateField(name, value, formData);
            setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));
        }
    }, [formData, validateField]);

    /**
     * Maneja la eliminación de un veterinario.
     */
    const handleDelete = useCallback(async (id) => {
        // Se recomienda reemplazar window.confirm por un modal personalizado en un entorno de producción.
        if (!window.confirm('¿Estás seguro de que quieres eliminar este veterinario? Esta acción es irreversible y puede fallar si tiene citas o historiales médicos asociados.')) {
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            const responseData = await authFetch(`/usuarios/${id}`, {
                method: 'DELETE'
            });

            if (responseData.success) {
                setVets(prevVets => prevVets.filter(vet => vet.id !== id));
                showNotification(responseData.message || 'Veterinario eliminado correctamente.');
            } else {
                showNotification(responseData.message || 'Error al eliminar veterinario.', 'error');
            }
        } catch (err) {
            console.error('Error deleting vet:', err);
            showNotification(`Error de conexión al eliminar: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [authFetch, showNotification, setError, setVets]);

    /**
     * Maneja el cambio de estado (activar/desactivar) de un veterinario.
     */
    const toggleStatus = useCallback(async (id, currentStatus) => {
        setIsSubmitting(true);
        setError('');
        try {
            const newStatus = currentStatus === 'active' ? 0 : 1;
            const responseData = await authFetch(`/usuarios/${id}`, {
                method: 'PUT',
                body: { active: newStatus }
            });

            if (responseData.success) {
                setVets(prevVets => prevVets.map(vetItem =>
                    vetItem.id === id ? {
                        ...vetItem,
                        active: newStatus,
                        status: newStatus ? 'active' : 'inactive'
                    } : vetItem
                ));
                showNotification(responseData.message || `Veterinario ${newStatus ? 'activado' : 'desactivado'} correctamente.`);
            } else {
                showNotification(responseData.message || 'Error al cambiar estado del veterinario.', 'error');
            }
        } catch (err) {
            showNotification(`Error al cambiar estado: ${err.message}`, 'error');
            console.error('Error toggling vet status:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [authFetch, showNotification, setVets, setError, setIsSubmitting]);

    /**
     * Prepara el formulario para editar un veterinario existente.
     */
    const handleEdit = useCallback((vet) => {
        setCurrentVet(vet);
        setFormData({
            nombre: vet.nombre,
            apellido: vet.apellido || '',
            email: vet.email,
            telefono: vet.telefono,
            direccion: vet.direccion || '',
            password: '', // Se deja vacío para que el usuario decida si cambiarla
            confirmPassword: ''
        });
        setValidationErrors({}); // Limpiar errores al abrir el formulario
        setIsFormOpen(true);
        setError('');
    }, []);

    /**
     * Prepara el formulario para agregar un nuevo veterinario.
     */
    const handleAddNew = useCallback(() => {
        setCurrentVet(null);
        setFormData({
            nombre: '', apellido: '', email: '', telefono: '', direccion: '',
            password: '', confirmPassword: ''
        });
        setValidationErrors({}); // Limpiar errores al abrir el formulario
        setIsFormOpen(true);
        setError('');
    }, []);

    /**
     * Cierra el modal del formulario y resetea sus estados.
     */
    const handleCancelForm = useCallback(() => {
        setIsFormOpen(false);
        setCurrentVet(null);
        setFormData({
            nombre: '', apellido: '', email: '', telefono: '', direccion: '',
            password: '', confirmPassword: ''
        });
        setValidationErrors({});
        setError('');
    }, []);

    /**
     * Maneja el envío del formulario, ya sea para crear o actualizar un veterinario.
     * Incluye validaciones y llamadas a la API.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        let errors = {};
        const isNewVetCheck = !currentVet;

        // Ejecutar todas las validaciones para poblar el objeto `errors`
        Object.keys(formData).forEach(key => {
            // No validar password/confirmPassword si no es nuevo y el campo está vacío
            if ((key === 'password' || key === 'confirmPassword') && !isNewVetCheck && formData[key].length === 0) {
                return;
            }
            const errorMessage = validateField(key, formData[key], formData, isNewVetCheck);
            if (errorMessage) {
                errors[key] = errorMessage;
            }
        });

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            showNotification('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            let responseData;
            const payload = { ...formData };
            delete payload.confirmPassword; // No enviar confirmPassword al backend

            if (currentVet) {
                // Si la contraseña está vacía en edición, no enviarla al backend para no cambiarla
                if (!payload.password) {
                    delete payload.password;
                }
                responseData = await authFetch(`/usuarios/${currentVet.id}`, {
                    method: 'PUT',
                    body: payload
                });

                if (responseData.success && responseData.data) {
                    setVets(prevVets => prevVets.map(vet =>
                        vet.id === currentVet.id ? {
                            ...vet,
                            ...responseData.data, // Los datos actualizados del backend
                            status: responseData.data.active ? 'active' : 'inactive' // Asegurar el estado actualizado
                        } : vet
                    ));
                    showNotification(responseData.message || 'Veterinario actualizado correctamente.');
                } else {
                    showNotification(responseData.message || 'Error al actualizar veterinario.', 'error');
                }
            } else {
                // Asignar rol y estado activo por defecto para nuevos veterinarios
                payload.role = 'veterinario';
                payload.active = 1; // Un nuevo veterinario se registra como activo por defecto
                responseData = await authFetch('/register', {
                    method: 'POST',
                    body: payload
                });

                if (responseData.success && responseData.data && responseData.data.id) {
                    setVets(prevVets => [...prevVets, {
                        ...responseData.data,
                        status: responseData.data.active ? 'active' : 'inactive'
                    }]);
                    showNotification(responseData.message || 'Veterinario creado correctamente.');
                } else {
                    showNotification(responseData.message || 'Error al crear veterinario.', 'error');
                }
            }

            handleCancelForm(); // Cerrar el modal y limpiar el formulario
            fetchVets(); // Recargar la lista para asegurar la consistencia de los datos
        } catch (err) {
            console.error('Error submitting form:', err);
            showNotification(`Error de conexión al enviar formulario: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [authFetch, currentVet, formData, showNotification, setVets, handleCancelForm, fetchVets, validateField, setError]);

    // Muestra un spinner de carga mientras se obtienen los datos iniciales
    if (isLoading && vets.length === 0 && !error) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinner-icon" />
                <p>Cargando veterinarios...</p>
            </div>
        );
    }

    // Muestra un mensaje de error si la carga inicial falla y no hay datos
    if (error && vets.length === 0) {
        return <div className="error-message"><FaInfoCircle className="icon" /> {error}</div>;
    }

    return (
        <div className="admin-content-container">
            {/* Área para mostrar notificaciones */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        key="vet-notification"
                        className={`notification ${notification.type}`}
                        initial={{ opacity: 0, y: -20, pointerEvents: 'none' }}
                        animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
                        exit={{ opacity: 0, y: -20, pointerEvents: 'none' }}
                        transition={{ duration: 0.3 }}
                    >
                        <FaInfoCircle className="notification-icon" />
                        {notification.message}
                        <button className="close-notification" onClick={() => setNotification(null)}>
                            <FaTimes />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de formulario para agregar/editar veterinarios */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        key="vet-form-modal"
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: "-100vh", opacity: 0 }}
                            animate={{ y: "0", opacity: 1 }}
                            exit={{ y: "100vh", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        >
                            <button
                                className="close-modal-btn"
                                onClick={handleCancelForm}
                                disabled={isSubmitting}
                            >
                                <FaTimes />
                            </button>
                            <div className="modal-header">
                                <h3>
                                    <FaUserMd className="form-icon" />
                                    {currentVet ? 'Editar Veterinario' : 'Nuevo Veterinario'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-grid">
                                    {currentVet && (
                                        <div className="form-group">
                                            <label htmlFor="id">ID</label>
                                            <input
                                                type="text"
                                                id="id"
                                                name="id"
                                                value={currentVet.id}
                                                disabled
                                                className="disabled-input-text"
                                            />
                                        </div>
                                    )}
                                    <div className="form-group">
                                        <label htmlFor="nombre">Nombre*</label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={isSubmitting}
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
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.apellido && <span className="error-message-inline">{validationErrors.apellido}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email*</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={!!currentVet || isSubmitting} // Deshabilitar si se está editando un veterinario existente
                                            required={!currentVet} // Requerido solo si es nuevo
                                        />
                                        {validationErrors.email && <span className="error-message-inline">{validationErrors.email}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="telefono">Teléfono*</label>
                                        <input
                                            type="text"
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={isSubmitting}
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
                                            value={formData.direccion}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            placeholder="Ej. Calle 15 #19C - 55"
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.direccion && <span className="error-message-inline">{validationErrors.direccion}</span>}
                                    </div>
                                    {/* Campos de contraseña solo se muestran para nuevos veterinarios o si el campo de password no está vacío en edición */}
                                    {(!currentVet || (formData.password && formData.password.length > 0)) && (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="password">Contraseña{ !currentVet ? '*' : ' (dejar en blanco para no cambiar)' }</label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    disabled={isSubmitting}
                                                    required={!currentVet} // Requerido solo al crear
                                                />
                                                {validationErrors.password && <span className="error-message-inline">{validationErrors.password}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="confirmPassword">Confirmar Contraseña{ !currentVet ? '*' : '' }</label>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    disabled={isSubmitting}
                                                    // Requerido si es nuevo o si se ha introducido algo en el campo de contraseña
                                                    required={!currentVet || (formData.password && formData.password.length > 0)}
                                                />
                                                {validationErrors.confirmPassword && <span className="error-message-inline">{validationErrors.confirmPassword}</span>}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={handleCancelForm}
                                        disabled={isSubmitting}
                                    >
                                        <FaTimes /> Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="save-btn"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <FaSpinner className="spinner-icon" /> Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> {currentVet ? 'Actualizar' : 'Guardar'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Encabezado del panel de gestión de veterinarios */}
            <div className="admin-content-header">
                <h2>
                    <FaUserMd className="header-icon" />
                    Gestión de Veterinarios
                </h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar veterinarios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading || isSubmitting}
                        />
                        {searchTerm && (
                            <button
                                className="clear-search"
                                onClick={() => setSearchTerm('')}
                                disabled={isLoading || isSubmitting}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                            disabled={isLoading || isSubmitting}
                        >
                            Todos
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('active')}
                            disabled={isLoading || isSubmitting}
                        >
                            Activos
                        </button>
                        <button
                            className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('inactive')}
                            disabled={isLoading || isSubmitting}
                        >
                            Inactivos
                        </button>
                    </div>

                    <button
                        className="add-btn"
                        onClick={handleAddNew}
                        disabled={isLoading || isSubmitting}
                    >
                        <FaPlus /> Nuevo Veterinario
                    </button>
                </div>
            </div>

            {/* Contenedor de la tabla de veterinarios */}
            <div className="admin-table-container">
                {filteredVets.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre Completo</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Dirección</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVets.map(vet => (
                                <tr key={vet.id}>
                                    <td>{vet.id}</td>
                                    <td>{`${vet.nombre} ${vet.apellido || ''}`}</td>
                                    <td>{vet.email}</td>
                                    <td>{vet.telefono}</td>
                                    <td>{vet.direccion || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${vet.status}`}>
                                            {vet.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => handleEdit(vet)}
                                            className="btn-edit"
                                            disabled={isLoading || isSubmitting}
                                            title="Editar Veterinario"
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                        <button
                                            className={`btn-status ${vet.status === 'active' ? 'inactive' : 'active'}`}
                                            onClick={() => toggleStatus(vet.id, vet.status)}
                                            disabled={isLoading || isSubmitting}
                                        >
                                            {vet.status === 'active' ? <FaBan /> : <FaCheck />}
                                            {vet.status === 'active' ? 'Desactivar' : 'Activar'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vet.id)}
                                            className="btn-delete"
                                            disabled={isLoading || isSubmitting}
                                            title="Eliminar Veterinario"
                                        >
                                            <FaTrash /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-results">
                        <FaInfoCircle className="info-icon" />
                        {searchTerm || filterStatus !== 'all' ?
                            'No se encontraron veterinarios que coincidan con la búsqueda o el filtro.' :
                            'No hay veterinarios registrados.'}
                        <button
                            className="add-btn"
                            onClick={handleAddNew}
                            disabled={isLoading || isSubmitting}
                        >
                            <FaPlus /> Agregar Veterinario
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VetsManagement;
