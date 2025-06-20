import React, { useState, useEffect, useCallback } from 'react';
import { FaUserShield, FaEdit, FaTrash, FaPlus, FaSearch, FaSave, FaTimes, FaSpinner, FaInfoCircle, FaCheck, FaBan } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Styles/AdminStyles.css'; // Importa AdminStyles.css que contiene los estilos generales, incluyendo los del modal

const AdminsManagement = () => {
    // --- Estados para gestionar los datos de los administradores y la UI ---
    const [admins, setAdmins] = useState([]); // Lista completa de administradores
    const [filteredAdmins, setFilteredAdmins] = useState([]); // Lista de administradores filtrados por búsqueda y estado
    const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
    const [filterStatus, setFilterStatus] = useState('all'); // Filtro por estado: 'all', 'active', 'inactive'
    const [isLoading, setIsLoading] = useState(true); // Indica si los datos están cargando
    const [error, setError] = useState(''); // Mensaje de error a nivel de componente
    const [isFormOpen, setIsFormOpen] = useState(false); // Controla la visibilidad del modal de formulario
    const [currentAdmin, setCurrentAdmin] = useState(null); // Administrador actualmente en edición (o null para nuevo)
    const [formData, setFormData] = useState({ // Datos del formulario de administrador
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        password: '',
        confirmPassword: ''
    });
    const [validationErrors, setValidationErrors] = useState({}); // Errores de validación por campo
    const [isSubmitting, setIsSubmitting] = useState(false); // Indica si el formulario se está enviando
    const [notification, setNotification] = useState(null); // Para mostrar mensajes de éxito/error temporales

    // Obtener el usuario logueado desde localStorage. Necesario para prevenir que un admin se elimine a sí mismo.
    const user = JSON.parse(localStorage.getItem('user')) || {};

    // Función auxiliar para obtener el token de autenticación del localStorage
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    /**
     * Función mejorada para realizar peticiones fetch con autenticación JWT.
     * Agrega automáticamente el token de autorización y maneja errores de respuesta HTTP.
     * @param {string} endpoint - El endpoint de la API relativo a /api/admin.
     * @param {object} options - Opciones para la petición fetch (método, body, headers adicionales).
     * @returns {Promise<object>} Los datos de la respuesta JSON.
     * @throws {Error} Si no se encuentra el token o la respuesta de la red no es OK.
     */
    const authFetch = useCallback(async (endpoint, options = {}) => {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin${endpoint}`, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }
            return response.json();
        } catch (err) {
            console.error("Error in authFetch:", err);
            throw err; // Re-lanza el error para que sea manejado por el useCallback que llama a authFetch
        }
    }, []); // Dependencias vacías porque getAuthToken no cambia y fetch no cambia

    /**
     * Muestra una notificación temporal en la UI.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de notificación ('success' o 'error').
     */
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        const timer = setTimeout(() => setNotification(null), 3000); // Notificación desaparece después de 3 segundos
        return () => clearTimeout(timer);
    }, []);

    /**
     * Función para cargar la lista de administradores desde la API.
     * Maneja los estados de carga y error.
     */
    const fetchAdmins = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await authFetch('/administrators');
            const data = response.data;

            const formattedAdmins = data.map(admin => ({
                id: admin.id,
                nombre: admin.nombre,
                apellido: admin.apellido || '',
                email: admin.email,
                telefono: admin.telefono,
                direccion: admin.direccion || '',
                active: admin.active,
                created_at: admin.created_at,
                name: `${admin.nombre} ${admin.apellido || ''}`.trim(),
                role: 'Administrador'
            }));

            setAdmins(formattedAdmins);
            setFilteredAdmins(formattedAdmins); // Inicialmente, los filtrados son todos los admins
        } catch (err) {
            setError(`Error al cargar administradores: ${err.message}`);
            showNotification(`Error al cargar administradores: ${err.message}`, 'error');
            console.error('Error fetching admins:', err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, showNotification]); // Dependencias para useCallback

    // Carga inicial de administradores cuando el componente se monta
    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    // Filtrado de administradores basado en término de búsqueda y estado
    useEffect(() => {
        let results = admins.filter(admin =>
            admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.telefono.includes(searchTerm) ||
            (admin.direccion && admin.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filterStatus === 'active') {
            results = results.filter(admin => admin.active);
        } else if (filterStatus === 'inactive') {
            results = results.filter(admin => !admin.active);
        }

        setFilteredAdmins(results);
    }, [searchTerm, admins, filterStatus]); // Se ejecuta cuando searchTerm, admins o filterStatus cambian


    /**
     * Función de validación EXTREMADAMENTE EXHAUSTIVA para cada campo del formulario.
     * Retorna un mensaje de error si el campo no es válido, o una cadena vacía si es válido.
     * @param {string} name - Nombre del campo a validar.
     * @param {string} value - Valor actual del campo.
     * @param {object} currentFormData - El estado completo del formulario para validaciones cruzadas.
     * @param {boolean} isNewAdmin - True si se está creando un nuevo administrador, false si se edita.
     * @returns {string} Mensaje de error.
     */
    const validateField = useCallback((name, value, currentFormData = formData, isNewAdmin = !currentAdmin) => {
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
            if (/(test|demo|example|placeholder|temp|prueba|admin|root|qwerty|password|usuario|contrasena|admin123|admintest|admindemo|nombreapellido|correo@email\.com)/i.test(trimmedValue)) {
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
                    const hasStreetNumberMatch = trimmedValue.match(/(?:calle|carrera|cll|cra|av|tv|dg|kr|km)\s+(\d+)/i);
                    const hasStreetNumber = hasStreetNumberMatch !== null && hasStreetNumberMatch[1] !== undefined;

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
                // Validación: Campo obligatorio
                if (!trimmedValue) {
                    message = 'Este campo es obligatorio.';
                }
                // Validación: Longitud mínima
                else if (trimmedValue.length < 8) {
                    message = 'Mínimo 8 caracteres.';
                }
                // Validación: Al menos una minúscula
                else if (!/(?=.*[a-z])/.test(trimmedValue)) {
                    message = 'Debe contener al menos una minúscula.';
                }
                // Validación: Al menos una mayúscula
                else if (!/(?=.*[A-Z])/.test(trimmedValue)) {
                    message = 'Debe contener al menos una mayúscula.';
                }
                // Validación: Al menos un número
                else if (!/(?=.*\d)/.test(trimmedValue)) {
                    message = 'Debe contener al menos un número.';
                }
                // Validación: Al menos un carácter especial (@$!%*?&)
                else if (!/(?=.*[@$!%*?&])/.test(trimmedValue)) {
                    message = 'Debe contener al menos un carácter especial (@$!%*?&).';
                }
                // Validación: Longitud máxima
                else if (trimmedValue.length > 30) {
                    message = 'Máximo 30 caracteres.';
                }
                break;

            case 'confirmPassword':
                // Validación: Requerido si se está estableciendo o cambiando la contraseña principal
                if ((currentFormData.password && currentFormData.password.length > 0) || isNewAdmin) {
                    if (!trimmedValue) {
                        message = 'Por favor, confirma tu contraseña. Este campo es obligatorio.';
                    }
                    // Validación: Debe coincidir exactamente con la contraseña principal
                    else if (trimmedValue !== currentFormData.password) {
                        message = 'Las contraseñas no coinciden. Asegúrate de que sean exactamente iguales.';
                    }
                    // Validación: Longitud mínima (como la principal)
                    else if (trimmedValue.length < 8) { // Ajustado a la nueva longitud mínima de la contraseña
                        message = 'La confirmación debe tener al menos 8 caracteres, igual que la contraseña principal.';
                    }
                    // Validación: Longitud máxima (como la principal)
                    else if (trimmedValue.length > 30) { // Ajustado a la nueva longitud máxima de la contraseña
                        message = 'La confirmación no debe exceder los 30 caracteres.';
                    }
                }
                break;
            default:
                break;
        }
        return message;
    }, [currentAdmin, formData]); // Dependencias para useCallback


    /**
     * Maneja los cambios en los campos de entrada del formulario y activa la validación en tiempo real.
     * @param {object} e - El evento de cambio.
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validar el campo actual y actualizar los errores de validación
        const updatedFormData = { ...formData, [name]: value };
        const errorMessage = validateField(name, value, updatedFormData, !currentAdmin);
        setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));

        // Si es el campo de contraseña, re-validar también confirmPassword si ya tiene un valor
        if (name === 'password' && updatedFormData.confirmPassword.length > 0) {
            const confirmPassError = validateField('confirmPassword', updatedFormData.confirmPassword, updatedFormData, !currentAdmin);
            setValidationErrors(prev => ({ ...prev, confirmPassword: confirmPassError }));
        }
    }, [formData, validateField, currentAdmin]); // Dependencias para useCallback

    /**
     * Maneja el evento onBlur (cuando un input pierde el foco) para activar la validación.
     * @param {object} e - El evento de blur.
     */
    const handleInputBlur = useCallback((e) => {
        const { name, value, required } = e.target;
        // Solo valida si el campo tiene contenido o si es un campo requerido.
        if (value.trim() !== '' || required) {
            const errorMessage = validateField(name, value, formData, !currentAdmin);
            setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));
        }
    }, [formData, validateField, currentAdmin]); // Dependencias para useCallback


    /**
     * Maneja la eliminación de un administrador.
     * @param {number} id - El ID del administrador a eliminar.
     */
    const handleDelete = useCallback(async (id) => {
        // Se recomienda reemplazar window.confirm por un modal personalizado en un entorno de producción.
        if (id === user.id) {
            showNotification('No puedes eliminar tu propio usuario. Por seguridad, esto no está permitido.', 'error');
            return;
        }

        if (!window.confirm('¿Estás seguro de que quieres eliminar este administrador? Esta acción es irreversible y no se podrá recuperar el usuario.')) {
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            const response = await authFetch(`/administrators/${id}`, {
                method: 'DELETE'
            });

            if (response.success) {
                setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== id));
                showNotification(response.message || 'Administrador eliminado correctamente.');
            } else {
                showNotification(response.message || 'Error al eliminar administrador.', 'error');
            }
        } catch (err) {
            showNotification(`Error al eliminar administrador: ${err.message}`, 'error');
            console.error('Error deleting admin:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [authFetch, showNotification, user.id]); // Dependencias para useCallback

    /**
     * Maneja el cambio de estado (activar/desactivar) de un administrador.
     * @param {number} id - El ID del administrador.
     * @param {boolean} currentActiveStatus - El estado activo actual del administrador.
     */
    const toggleStatus = useCallback(async (id, currentActiveStatus) => {
        if (id === user.id) {
            showNotification('No puedes cambiar el estado de tu propio usuario.', 'error');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            const newStatus = currentActiveStatus ? 0 : 1; // 0 para inactivo, 1 para activo
            const response = await authFetch(`/administrators/${id}`, {
                method: 'PUT',
                body: { active: newStatus } // Envía solo el campo 'active'
            });

            if (response.success) {
                setAdmins(prevAdmins => prevAdmins.map(admin =>
                    admin.id === id ? { ...admin, active: newStatus } : admin
                ));
                showNotification(response.message || `Administrador ${newStatus ? 'activado' : 'desactivado'} correctamente.`);
            } else {
                showNotification(response.message || 'Error al cambiar estado del administrador.', 'error');
            }
        } catch (err) {
            showNotification(`Error al cambiar estado: ${err.message}`, 'error');
            console.error('Error toggling admin status:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [authFetch, showNotification, user.id]); // Dependencias para useCallback


    /**
     * Abre el formulario modal para editar un administrador existente.
     * @param {object} admin - El objeto administrador a editar.
     */
    const handleEdit = useCallback((admin) => {
        setCurrentAdmin(admin);
        setFormData({
            nombre: admin.nombre,
            apellido: admin.apellido || '',
            email: admin.email,
            telefono: admin.telefono,
            direccion: admin.direccion || '',
            password: '', // Las contraseñas no se precargan por seguridad
            confirmPassword: ''
        });
        setValidationErrors({}); // Limpiar errores de validación al abrir el formulario
        setIsFormOpen(true);
        setError('');
    }, []); // Dependencias vacías para useCallback

    /**
     * Abre el formulario modal para agregar un nuevo administrador.
     */
    const handleAddNew = useCallback(() => {
        setCurrentAdmin(null);
        setFormData({ // Limpia los datos del formulario para una nueva entrada
            nombre: '', apellido: '', email: '', telefono: '', direccion: '',
            password: '', confirmPassword: ''
        });
        setValidationErrors({}); // Limpiar errores de validación al abrir el formulario
        setIsFormOpen(true);
        setError('');
    }, []); // Dependencias vacías para useCallback

    /**
     * Cierra el modal del formulario y resetea sus estados.
     */
    const handleCancelForm = useCallback(() => {
        setIsFormOpen(false);
        setCurrentAdmin(null);
        setFormData({
            nombre: '', apellido: '', email: '', telefono: '', direccion: '',
            password: '', confirmPassword: ''
        });
        setValidationErrors({});
        setError('');
    }, []); // Dependencias vacías para useCallback

    /**
     * Maneja el envío del formulario, ya sea para crear o actualizar un administrador.
     * Realiza validaciones exhaustivas y llama a la API correspondiente.
     * @param {object} e - El evento de envío del formulario.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        let errors = {};
        const isNewAdminCheck = !currentAdmin;

        // Ejecutar TODAS las validaciones para poblar el objeto `errors`
        Object.keys(formData).forEach(key => {
            // Excepción: no validar password/confirmPassword si es edición y los campos están vacíos
            if ((key === 'password' || key === 'confirmPassword') && !isNewAdminCheck && formData[key].length === 0) {
                return;
            }
            const errorMessage = validateField(key, formData[key], formData, isNewAdminCheck);
            if (errorMessage) {
                errors[key] = errorMessage;
            }
        });

        setValidationErrors(errors); // Actualiza los errores para mostrar en la UI

        // Si hay algún error de validación, detén el envío del formulario
        if (Object.keys(errors).length > 0) {
            showNotification('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            return;
        }

        setIsSubmitting(true); // Activa el spinner de carga
        try {
            let responseData;
            // Prepara el payload, excluyendo confirmPassword ya que no se envía al backend
            const payload = { ...formData };
            delete payload.confirmPassword;

            if (currentAdmin) {
                // Lógica para ACTUALIZAR un administrador existente
                // Si el campo de contraseña está vacío, no se envía al backend para no cambiarla
                if (!payload.password) {
                    delete payload.password;
                }
                responseData = await authFetch(`/administrators/${currentAdmin.id}`, {
                    method: 'PUT',
                    body: payload
                });

                if (responseData.success && responseData.data) {
                    // Actualiza el administrador en el estado local con los datos recibidos del backend
                    setAdmins(prevAdmins => prevAdmins.map(admin =>
                        admin.id === currentAdmin.id ? {
                            ...admin,
                            ...responseData.data, // Usa los datos actualizados del backend
                            name: `${responseData.data.nombre} ${responseData.data.apellido || ''}`.trim()
                        } : admin
                    ));
                    showNotification(responseData.message || 'Administrador actualizado correctamente.');
                } else {
                    showNotification(responseData.message || 'Error al actualizar administrador.', 'error');
                }

            } else {
                // Lógica para CREAR un nuevo administrador
                payload.role = 'administrador'; // Asegura que el rol sea 'administrador'
                payload.active = 1; // Un nuevo administrador se registra como activo por defecto

                responseData = await authFetch('/administrators', { // Asegúrate de que este endpoint sea correcto para crear administradores
                    method: 'POST',
                    body: payload
                });

                if (responseData.success && responseData.data && responseData.data.id) {
                    // Agrega el nuevo administrador al estado local con el ID y otros datos de la respuesta del backend
                    const newAdmin = {
                        id: responseData.data.id,
                        ...responseData.data, // Usa los datos completos devueltos por el backend
                        name: `${responseData.data.nombre} ${responseData.data.apellido || ''}`.trim(),
                        role: responseData.data.role || 'administrador', // Asegura el rol
                        active: responseData.data.active !== undefined ? responseData.data.active : 1, // Si active no viene, asume 1
                        created_at: responseData.data.created_at || new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
                    };
                    setAdmins(prevAdmins => [...prevAdmins, newAdmin]);
                    showNotification(responseData.message || 'Administrador creado correctamente.');
                } else {
                    showNotification(responseData.message || 'Error al crear administrador.', 'error');
                }
            }

            handleCancelForm(); // Cierra el modal del formulario tras el éxito y resetea el form
            fetchAdmins(); // Recarga la lista para asegurar la consistencia de los datos
        } catch (err) {
            // Muestra un mensaje de error específico
            showNotification(`Error al guardar administrador: ${err.message}`, 'error');
            console.error('Error submitting form:', err);
        } finally {
            setIsSubmitting(false); // Desactiva el estado de envío (oculta el spinner)
        }
    }, [authFetch, currentAdmin, formData, showNotification, setAdmins, handleCancelForm, fetchAdmins, validateField, setError]); // Dependencias para useCallback


    // Renderizado condicional: Muestra spinner mientras carga por primera vez
    if (isLoading && admins.length === 0 && !error) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinner-icon" />
                <p>Cargando administradores...</p>
            </div>
        );
    }

    // Renderizado condicional: Muestra mensaje de error si la carga inicial falla y no hay datos
    if (error && admins.length === 0) {
        return <div className="error-message"><FaInfoCircle className="icon" /> {error}</div>;
    }

    return (
        <div className="admin-content-container"> {/* Clase general para el contenido de administración */}
            {/* Componente para mostrar notificaciones (éxito/error) */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        key="admin-notification"
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

            {/* Modal para el formulario de agregar/editar administrador */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        key="admin-form-modal"
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
                            {/* Botón para cerrar el modal */}
                            <button
                                className="close-modal-btn"
                                onClick={handleCancelForm}
                                disabled={isSubmitting}
                            >
                                <FaTimes />
                            </button>
                            {/* Título del formulario */}
                            <div className="modal-header">
                                <h3>
                                    <FaUserShield className="form-icon" />
                                    {currentAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-grid">
                                    {/* Campo: ID (solo lectura si es edición) */}
                                    {currentAdmin && (
                                        <div className="form-group">
                                            <label htmlFor="id">ID</label>
                                            <input
                                                type="text"
                                                id="id"
                                                name="id"
                                                value={currentAdmin.id}
                                                disabled
                                                className="disabled-input-text"
                                            />
                                        </div>
                                    )}
                                    {/* Campo: Nombre */}
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
                                    {/* Campo: Apellido */}
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
                                    {/* Campo: Email (deshabilitado si se edita un admin existente) */}
                                    <div className="form-group">
                                        <label htmlFor="email">Email*</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onBlur={handleInputBlur}
                                            disabled={!!currentAdmin || isSubmitting} // Deshabilita si es edición
                                            required={!currentAdmin} // Requerido solo si es nuevo
                                        />
                                        {validationErrors.email && <span className="error-message-inline">{validationErrors.email}</span>}
                                    </div>
                                    {/* Campo: Teléfono */}
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
                                    {/* Campo: Dirección */}
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
                                    {/* Campos de contraseña (solo visibles para nuevos administradores o si el campo de password no está vacío en edición) */}
                                    {(!currentAdmin || (formData.password && formData.password.length > 0)) && (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="password">Contraseña{ !currentAdmin ? '*' : ' (dejar en blanco para no cambiar)' }</label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    disabled={isSubmitting}
                                                    required={!currentAdmin} // Requerido solo al crear
                                                />
                                                {validationErrors.password && <span className="error-message-inline">{validationErrors.password}</span>}
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="confirmPassword">Confirmar Contraseña{ !currentAdmin ? '*' : '' }</label>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    onBlur={handleInputBlur}
                                                    disabled={isSubmitting}
                                                    // Requerido si es nuevo o si se ha introducido algo en el campo de contraseña
                                                    required={!currentAdmin || (formData.password && formData.password.length > 0)}
                                                />
                                                {validationErrors.confirmPassword && <span className="error-message-inline">{validationErrors.confirmPassword}</span>}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="form-actions">
                                    {/* Botón Cancelar */}
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={handleCancelForm}
                                        disabled={isSubmitting}
                                    >
                                        <FaTimes /> Cancelar
                                    </button>
                                    {/* Botón Guardar/Actualizar */}
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
                                                <FaSave /> {currentAdmin ? 'Actualizar' : 'Guardar'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Encabezado del panel de administración */}
            <div className="admin-content-header">
                <h2><FaUserShield className="header-icon" /> Gestión de Administradores</h2>
                <div className="header-actions">
                    {/* Barra de búsqueda */}
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar administradores..."
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
                    {/* Botones de filtro por estado */}
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
                    {/* Botón para agregar nuevo administrador */}
                    <button
                        onClick={handleAddNew}
                        className="add-btn"
                        disabled={isLoading || isSubmitting}
                    >
                        <FaPlus /> Nuevo Administrador
                    </button>
                </div>
            </div>

            {/* Contenedor de la tabla de administradores */}
            <div className="admin-table-container">
                {filteredAdmins.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre Completo</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Dirección</th>
                                <th>Estado</th>
                                <th>Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Mapea y renderiza cada administrador en una fila de la tabla */}
                            {filteredAdmins.map(admin => (
                                <tr key={admin.id} className={admin.id === user.id ? 'current-user-row' : ''}>
                                    <td>{admin.id}</td>
                                    <td>{`${admin.nombre} ${admin.apellido || ''}`}</td>
                                    <td>{admin.email}</td>
                                    <td>{admin.telefono}</td>
                                    <td>{admin.direccion || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${admin.active ? 'active' : 'inactive'}`}>
                                            {admin.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>{new Date(admin.created_at).toLocaleDateString()}</td> {/* Formatea la fecha */}
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => handleEdit(admin)}
                                            className="edit-btn"
                                            disabled={isLoading || isSubmitting}
                                            title="Editar Administrador"
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(admin.id, admin.active)}
                                            className={`status-toggle-btn ${admin.active ? 'active' : 'inactive'}`}
                                            disabled={admin.id === user.id || isLoading || isSubmitting}
                                            title={admin.id === user.id ? 'No puedes cambiar tu propio estado' : (admin.active ? 'Desactivar Administrador' : 'Activar Administrador')}
                                        >
                                            {admin.active ? <FaBan /> : <FaCheck />}
                                            {admin.active ? ' Desactivar' : ' Activar'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(admin.id)}
                                            className="delete-btn"
                                            disabled={admin.id === user.id || isLoading || isSubmitting}
                                            title={admin.id === user.id ? 'No puedes eliminar tu propio usuario' : 'Eliminar Administrador'}
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
                        {/* Icono para no results */}
                        <FaInfoCircle className="info-icon" />
                        {searchTerm || filterStatus !== 'all' ?
                            'No se encontraron administradores que coincidan con la búsqueda o el filtro.' :
                            'No hay administradores registrados.'}
                        <button
                            className="add-btn"
                            onClick={handleAddNew}
                            disabled={isLoading || isSubmitting}
                        >
                            <FaPlus /> Agregar Administrador
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminsManagement;
