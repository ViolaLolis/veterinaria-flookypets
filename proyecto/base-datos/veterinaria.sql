DROP DATABASE IF EXISTS veterinaria;
CREATE DATABASE veterinaria;
USE veterinaria;

-- Tabla de usuarios (clientes, veterinarios, administradores)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50),
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(100),
    tipo_documento VARCHAR(20),
    numero_documento VARCHAR(20),
    fecha_nacimiento DATE,
    role VARCHAR(20) DEFAULT 'usuario', -- 'usuario', 'veterinario', 'admin'
    active TINYINT(1) DEFAULT 1 COMMENT '1=activo, 0=inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(50),
    reset_token_expires DATETIME,
    experiencia VARCHAR(100), -- Campo para veterinarios
    universidad VARCHAR(150), -- Campo para veterinarios
    horario VARCHAR(255), -- Campo para veterinarios
    imagen_url VARCHAR(255) NULL -- NUEVO CAMPO para la URL de la imagen de perfil
);

-- Tabla de mascotas (id_propietario ahora referencia usuarios.id)
CREATE TABLE mascotas (
    id_mascota INT AUTO_INCREMENT PRIMARY KEY,
    id_propietario INT NOT NULL, -- Referencia a usuarios.id
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raza VARCHAR(100),
    edad INT,
    peso DECIMAL(5,2),
    fecha_nacimiento DATE,
    color VARCHAR(50),
    sexo ENUM('Macho', 'Hembra', 'Desconocido'),
    microchip VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imagen_url VARCHAR(255) NULL, -- NUEVO CAMPO para la URL de la imagen de la mascota
    FOREIGN KEY (id_propietario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de historial médico
CREATE TABLE historial_medico (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_mascota INT NOT NULL,
    fecha_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
    veterinario INT, -- Referencia a usuarios.id (veterinario o admin)
    diagnostico TEXT,
    tratamiento TEXT,
    observaciones TEXT,
    peso_actual DECIMAL(5,2),
    temperatura DECIMAL(4,2),
    proxima_cita DATE,
    FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota) ON DELETE CASCADE,
    FOREIGN KEY (veterinario) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de servicios
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    precio VARCHAR(50) NOT NULL
);

-- Tabla de citas (id_cliente ahora referencia usuarios.id)
CREATE TABLE citas (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL, -- Referencia a usuarios.id
    id_servicio INT NOT NULL,
    id_veterinario INT, -- Referencia a usuarios.id (veterinario o admin)
    id_mascota INT NOT NULL, -- NUEVO CAMPO: Referencia a mascotas.id_mascota
    fecha DATETIME NOT NULL,
    servicios VARCHAR(255), -- Este campo parece ser un duplicado de id_servicio, considerar su uso.
    estado ENUM('pendiente', 'aceptada', 'rechazada', 'completa', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
    FOREIGN KEY (id_veterinario) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota) ON DELETE CASCADE -- NUEVA CLAVE FORÁNEA
);

-- Tabla para el historial de contraseñas (se mantiene)
CREATE TABLE password_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- NUEVA TABLA: notificaciones
CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL, -- El usuario que recibe la notificación
    tipo VARCHAR(50) NOT NULL, -- 'cita_creada_vet', 'cita_aceptada_user', 'cita_rechazada_user', 'permiso_mascota_solicitud'
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    referencia_id INT, -- ID de la cita, mascota, etc.
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- Inserción de datos iniciales en servicios
INSERT INTO servicios (nombre, descripcion, precio) VALUES
('Consulta General', 'Revisión médica básica para tu mascota.', '$50.000'),
('Vacunación', 'Programas de vacunación personalizados para proteger a tu compañero.', '$30.000'),
('Estética Canina y Felina', 'Baño, corte de pelo y otros tratamientos de belleza.', '$40.000'),
('Cirugía', 'Procedimientos quirúrgicos con equipo moderno y veterinarios especializados.', 'Consultar'),
('Diagnóstico por Imagen', 'Rayos X, ecografías y otros métodos de diagnóstico avanzado.', 'Consultar'),
('Laboratorio Clínico', 'Análisis de sangre, orina y otros fluidos corporales.', '25.000');

-- Inserción de datos iniciales y extendidos en usuarios
-- Contraseña '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze' es un placeholder seguro para 'password'
-- Se añade imagen_url a los usuarios de ejemplo
INSERT INTO usuarios (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role, experiencia, universidad, horario, imagen_url) VALUES
('admin@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Admin', 'Principal', '3001234567', 'Calle Admin 123', 'CC', '123456789', '1980-01-01', 'admin', '10 AÑOS', 'UNIVERSIDAD NACIONAL DE COLOMBIA', 'LUNES A VIERNES: 8:00 AM - 5:00 PM', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/admin_profile.jpg'),
('vet@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Carlos', 'Veterinario', '3102345678', 'Carrera Vet 456', 'CC', '987654321', '1985-05-15', 'veterinario', '5 AÑOS', 'UNIVERSIDAD DE LOS ANDES', 'LUNES A SÁBADO: 9:00 AM - 6:00 PM', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/vet_carlos.jpg'),
('user@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Juan', 'Pérez', '3203456789', 'Avenida Usuario 789', 'CC', '456123789', '1990-10-20', 'usuario', NULL, NULL, NULL, 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_juan.jpg');

-- Más usuarios existentes (veterinarios y administradores con datos nuevos)
INSERT INTO usuarios (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role, experiencia, universidad, horario, imagen_url) VALUES
('vet1@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Laura', 'Gómez', '3101234567', 'Calle Veterinaria 1', 'CC', '11223344', '1985-03-15', 'veterinario', '7 AÑOS', 'UNIVERSIDAD DE LA SALLE', 'LUNES, MIÉRCOLES, VIERNES: 8:00 AM - 4:00 PM', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/vet_laura.jpg'),
('vet2@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Mario', 'Hernández', '3152345678', 'Avenida Animales 2', 'CC', '22334455', '1988-07-22', 'veterinario', '5 AÑOS', 'UNIVERSIDAD JAVERIANA', 'MARTES, JUEVES: 10:00 AM - 7:00 PM', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/vet_mario.jpg'),
('vet3@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Sandra', 'Pérez', '3203456789', 'Carrera Mascotas 3', 'CC', '33445566', '1990-11-30', 'veterinario', '3 AÑOS', 'UNIVERSIDAD UDCA', 'SÁBADOS: 9:00 AM - 2:00 PM', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/vet_sandra.jpg'),
('admin1@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Carolina', 'Díaz', '3004567890', 'Calle Recepción 4', 'CC', '44556677', '1992-05-18', 'admin', '8 AÑOS', 'UNIVERSIDAD NACIONAL DE COLOMBIA', 'LUNES A VIERNES: 9:00 AM - 6:00 PM', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/admin_carolina.jpg'),
('admin2@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Roberto', 'Martínez', '3155678901', 'Avenida Ayudante 5', 'CC', '55667788', '1993-09-25', 'admin', '6 AÑOS', 'UNIVERSIDAD EXTERNADO', 'LUNES A SÁBADO: 8:30 AM - 5:30 PM', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/admin_roberto.jpg');

-- Más usuarios de rol 'usuario'
INSERT INTO usuarios (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role, imagen_url) VALUES
('user1@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Alejandro', 'Rojas', '3206789012', 'Carrera Usuario 6', 'CC', '66778899', '1987-02-14', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_alejandro.jpg'), -- ID 9
('user2@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Gabriela', 'Sánchez', '3007890123', 'Calle Cliente 7', 'CC', '77889900', '1995-08-03', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_gabriela.jpg'), -- ID 10
('user3@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Felipe', 'Gutiérrez', '3158901234', 'Avenida Propietario 8', 'CC', '88990011', '1989-12-19', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_felipe.jpg'), -- ID 11
('user4@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Daniela', 'Castillo', '3209012345', 'Carrera Dueño 9', 'CC', '99001122', '1991-04-27', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_daniela.jpg'), -- ID 12
('user5@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Javier', 'Ortiz', '3000123456', 'Calle Mascotero 10', 'CC', '00112233', '1994-06-08', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_javier.jpg'), -- ID 13
('user6@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Lucía', 'Mendoza', '3151234567', 'Avenida Animalista 11', 'CC', '11223344', '1986-10-15', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_lucia.jpg'), -- ID 14
('user7@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Ricardo', 'Vega', '3202345678', 'Carrera Pet 12', 'CC', '22334455', '1993-01-22', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_ricardo.jpg'), -- ID 15
('user8@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Patricia', 'Castro', '3003456789', 'Calle Amante 13', 'CC', '33445566', '1988-07-30', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_patricia.jpg'), -- ID 16
('user9@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Hugo', 'Ríos', '3154567890', 'Avenida Cuidados 14', 'CC', '44556677', '1990-03-17', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_hugo.jpg'), -- ID 17
('user10@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Camila', 'Navarro', '3205678901', 'Carrera Feliz 15', 'CC', '55667788', '1992-09-24', 'usuario', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/user_camila.jpg'); -- ID 18


-- Inserción de datos en mascotas (id_propietario ahora es el id de usuario)
-- Se añade imagen_url a las mascotas de ejemplo
INSERT INTO mascotas (id_propietario, nombre, especie, raza, edad, peso, fecha_nacimiento, color, sexo, microchip, imagen_url) VALUES
(3, 'Max', 'Perro', 'Labrador Retriever', 3, 28.5, '2020-05-10', 'Dorado', 'Macho', '123456789012345', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_max.jpg'), -- ID 1 (Juan Pérez)
(3, 'Luna', 'Gato', 'Siamés', 2, 4.2, '2021-03-15', 'Blanco y café', 'Hembra', '234567890123456', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_luna.jpg'), -- ID 2 (Juan Pérez)
(9, 'Rocky', 'Perro', 'Bulldog Francés', 4, 12.3, '2019-01-20', 'Atigrado', 'Macho', '345678901234567', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_rocky.jpg'), -- ID 3 (Alejandro Rojas)
(10, 'Milo', 'Gato', 'Mestizo', 1, 3.8, '2022-07-05', 'Negro', 'Macho', NULL, 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_milo.jpg'), -- ID 4 (Gabriela Sánchez)
(11, 'Bella', 'Perro', 'Golden Retriever', 5, 30.0, '2018-11-12', 'Dorado', 'Hembra', '456789012345678', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_bella.jpg'), -- ID 5 (Felipe Gutiérrez)
(12, 'Simba', 'Gato', 'Persa', 2, 5.1, '2021-02-28', 'Gris', 'Macho', '567890123456789', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_simba.jpg'), -- ID 6 (Daniela Castillo)
(13, 'Coco', 'Perro', 'Chihuahua', 7, 2.5, '2016-09-17', 'Café', 'Hembra', '678901234567890', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_coco.jpg'), -- ID 7 (Javier Ortiz)
(14, 'Leo', 'Perro', 'Pastor Alemán', 2, 35.0, '2021-04-22', 'Negro y café', 'Macho', '789012345678901', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_leo.jpg'), -- ID 8 (Lucía Mendoza)
(15, 'Lola', 'Gato', 'Bengalí', 1, 4.5, '2022-08-30', 'Atigrado', 'Hembra', NULL, 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_lola.jpg'), -- ID 9 (Ricardo Vega)
(16, 'Toby', 'Perro', 'Beagle', 6, 15.0, '2017-12-05', 'Tricolor', 'Macho', '890123456789012', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_toby.jpg'), -- ID 10 (Patricia Castro)
(17, 'Mia', 'Gato', 'Ragdoll', 3, 5.8, '2020-06-18', 'Blanco y gris', 'Hembra', '901234567890123', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_mia.jpg'), -- ID 11 (Hugo Ríos)
(18, 'Bruno', 'Perro', 'Boxer', 4, 32.0, '2019-03-25', 'Atigrado', 'Macho', '012345678901234', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_bruno.jpg'), -- ID 12 (Camila Navarro)
(3, 'Lily', 'Gato', 'Esfinge', 2, 3.9, '2021-10-10', 'Rosa', 'Hembra', NULL, 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_lily.jpg'), -- ID 13 (Juan Pérez)
(9, 'Zeus', 'Perro', 'Husky Siberiano', 3, 25.0, '2020-01-15', 'Blanco y negro', 'Macho', '123450987654321', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_zeus.jpg'), -- ID 14 (Alejandro Rojas)
(10, 'Nala', 'Gato', 'Maine Coon', 1, 6.2, '2022-05-20', 'Atigrado', 'Hembra', '234561098765432', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_nala.jpg'), -- ID 15 (Gabriela Sánchez)
(11, 'Thor', 'Perro', 'Doberman', 5, 38.0, '2018-08-08', 'Negro y café', 'Macho', '345672109876543', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_thor.jpg'), -- ID 16 (Felipe Gutiérrez)
(12, 'Cleo', 'Gato', 'Mestizo', 2, 4.0, '2021-07-12', 'Atigrado', 'Hembra', NULL, 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_cleo.jpg'), -- ID 17 (Daniela Castillo)
(13, 'Rex', 'Perro', 'Rottweiler', 4, 42.0, '2019-04-03', 'Negro y café', 'Macho', '456783210987654', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_rex.jpg'), -- ID 18 (Javier Ortiz)
(14, 'Molly', 'Gato', 'Británico de Pelo Corto', 3, 5.5, '2020-09-25', 'Gris', 'Hembra', '567894321098765', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_molly.jpg'), -- ID 19 (Lucía Mendoza)
(15, 'Duke', 'Perro', 'Gran Danés', 2, 50.0, '2021-11-30', 'Negro', 'Macho', '678905432109876', 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_duke.jpg'); -- ID 20 (Ricardo Vega)


-- Inserción de datos en historial_medico
-- Asegúrate de que id_mascota exista y veterinario sea un ID de un usuario con role 'veterinario' o 'admin'
INSERT INTO historial_medico (id_mascota, veterinario, diagnostico, tratamiento, observaciones, peso_actual, temperatura, proxima_cita) VALUES
(1, 2, 'Control anual de salud', 'Vacuna antirrábica', 'Mascota en buen estado de salud', 28.5, 38.5, '2024-05-10'), -- Mascota 1 (Max), Vet 2 (Carlos)
(2, 4, 'Desparasitación', 'Tabletas antiparasitarias', 'Sin problemas detectados', 4.2, 38.7, '2023-09-15'), -- Mascota 2 (Luna), Vet 4 (Laura)
(3, 5, 'Problemas de piel', 'Shampoo medicado y antibióticos', 'Posible alergia alimentaria', 12.0, 39.0, '2023-07-20'), -- Mascota 3 (Rocky), Vet 5 (Mario)
(4, 6, 'Castración', 'Postoperatorio controlado', 'Recuperación normal', 3.8, 38.5, '2023-08-05'), -- Mascota 4 (Milo), Vet 6 (Sandra)
(5, 2, 'Control de peso', 'Dieta especial y ejercicio', 'Sobrepeso moderado', 30.5, 38.6, '2023-08-12'), -- Mascota 5 (Bella), Vet 2 (Carlos)
(6, 4, 'Infección ocular', 'Gotas oftálmicas', 'Mejoría en 48 horas', 5.1, 38.9, '2023-07-28'), -- Mascota 6 (Simba), Vet 4 (Laura)
(7, 5, 'Control geriátrico', 'Suplementos articulares', 'Artritis incipiente', 2.4, 38.4, '2023-09-17'), -- Mascota 7 (Coco), Vet 5 (Mario)
(8, 4, 'Vacunación anual', 'Vacuna múltiple', 'Reacción normal', 35.2, 38.8, '2024-04-22'), -- Mascota 8 (Leo), Vet 4 (Laura)
(9, 6, 'Control de crecimiento', 'Alimentación balanceada', 'Desarrollo adecuado', 4.7, 38.6, '2023-10-30'), -- Mascota 9 (Lola), Vet 6 (Sandra)
(10, 2, 'Problemas digestivos', 'Dieta blanda y probióticos', 'Posible intolerancia', 15.0, 39.1, '2023-08-05'), -- Mascota 10 (Toby), Vet 2 (Carlos)
(11, 2, 'Control de esterilización', 'Postoperatorio', 'Recuperación sin complicaciones', 5.7, 38.5, '2023-09-18'), -- Mascota 11 (Mia), Vet 2 (Carlos)
(12, 4, 'Dermatitis', 'Antihistamínicos y crema', 'Alergia ambiental', 3.8, 38.7, '2023-08-10'), -- Mascota 12 (Bruno), Vet 4 (Laura)
(13, 5, 'Control de vacunas', 'Vacuna antirrábica y múltiple', 'Buen estado general', 25.3, 38.5, '2024-01-15'), -- Mascota 13 (Lily), Vet 5 (Mario)
(14, 2, 'Control de peso', 'Aumento de ración', 'Bajo peso para la raza', 6.5, 38.9, '2023-08-20'), -- Mascota 14 (Zeus), Vet 2 (Carlos)
(15, 6, 'Problemas articulares', 'Suplementos y antiinflamatorios', 'Displasia de cadera', 38.0, 38.7, '2023-09-08'), -- Mascota 15 (Nala), Vet 6 (Sandra)
(16, 4, 'Control de salud', 'Desparasitación', 'Sin problemas detectados', 4.1, 38.5, '2023-10-12'), -- Mascota 16 (Thor), Vet 4 (Laura)
(17, 5, 'Herida en pata', 'Curación y antibióticos', 'Herida superficial', 42.0, 39.2, '2023-07-03'), -- Mascota 17 (Cleo), Vet 5 (Mario)
(18, 2, 'Control dental', 'Limpieza dental', 'Sarro moderado', 5.4, 38.6, '2024-03-25'), -- Mascota 18 (Rex), Vet 2 (Carlos)
(19, 6, 'Control de crecimiento', 'Alimentación para cachorro grande', 'Desarrollo adecuado', 52.0, 38.8, '2023-11-30'), -- Mascota 19 (Molly), Vet 6 (Sandra)
(20, 4, 'Revisión general', 'Chequeo completo', 'Mascota sana', 50.0, 38.7, '2024-06-30'); -- Mascota 20 (Duke), Vet 4 (Laura)

-- Inserción de datos en citas
-- Asegúrate de que id_cliente sea un ID de un usuario con role 'usuario'
-- Asegúrate de que id_servicio exista y id_veterinario sea un ID de un usuario con role 'veterinario' o 'admin'
-- Se añade id_mascota a las inserciones de citas
INSERT INTO citas (id_cliente, id_servicio, id_veterinario, id_mascota, fecha, servicios, estado) VALUES
(3, 1, 2, 1, '2030-06-15 09:00:00', 'Consultorio 1', 'aceptada'), -- Juan Pérez (ID 3), Vet 2 (Carlos), Mascota 1 (Max)
(9, 2, 4, 3, '2030-07-15 10:30:00', 'Consultorio 2', 'aceptada'), -- Alejandro Rojas (ID 9), Vet 4 (Laura), Mascota 3 (Rocky)
(10, 3, 2, 4, '2030-07-16 11:00:00', 'Sala de Estética', 'aceptada'), -- Gabriela Sánchez (ID 10), Vet 2 (Carlos), Mascota 4 (Milo)
(11, 1, 4, 5, '2030-07-16 14:00:00', 'Consultorio 1', 'pendiente'), -- Felipe Gutiérrez (ID 11), Vet 4 (Laura), Mascota 5 (Bella)
(12, 2, 5, 6, '2030-02-17 09:30:00', 'Consultorio 2', 'aceptada'), -- Daniela Castillo (ID 12), Vet 5 (Mario), Mascota 6 (Simba)
(13, 4, 6, 7, '2030-02-17 11:00:00', 'Quirófano', 'aceptada'), -- Javier Ortiz (ID 13), Vet 6 (Sandra), Mascota 7 (Coco)
(14, 5, 5, 8, '2030-03-18 10:00:00', 'Sala de Rayos X', 'pendiente'), -- Lucía Mendoza (ID 14), Vet 5 (Mario), Mascota 8 (Leo)
(15, 6, 6, 9, '2030-01-18 15:00:00', 'Laboratorio', 'aceptada'), -- Ricardo Vega (ID 15), Vet 6 (Sandra), Mascota 9 (Lola)
(16, 1, 2, 10, '2030-03-19 08:30:00', 'Consultorio 1', 'aceptada'), -- Patricia Castro (ID 16), Vet 2 (Carlos), Mascota 10 (Toby)
(17, 3, 4, 11, '2030-05-19 13:00:00', 'Sala de Estética', 'pendiente'), -- Hugo Ríos (ID 17), Vet 4 (Laura), Mascota 11 (Mia)
(18, 2, 5, 12, '2030-04-20 10:00:00', 'Consultorio 2', 'aceptada'), -- Camila Navarro (ID 18), Vet 5 (Mario), Mascota 12 (Bruno)
(3, 5, 6, 13, '2030-08-20 11:30:00', 'Sala de Rayos X', 'aceptada'), -- Juan Pérez (ID 3), Vet 6 (Sandra), Mascota 13 (Lily)
(9, 1, 2, 14, '2030-09-21 09:00:00', 'Consultorio 1', 'pendiente'), -- Alejandro Rojas (ID 9), Vet 2 (Carlos), Mascota 14 (Zeus)
(10, 4, 4, 15, '2030-12-21 14:00:00', 'Quirófano', 'aceptada'), -- Gabriela Sánchez (ID 10), Vet 4 (Laura), Mascota 15 (Nala)
(11, 6, 5, 16, '2023-10-22 10:30:00', 'Laboratorio', 'aceptada'), -- Felipe Gutiérrez (ID 11), Vet 5 (Mario), Mascota 16 (Thor)
(12, 3, 6, 17, '2030-11-22 12:00:00', 'Sala de Estética', 'completa'), -- Daniela Castillo (ID 12), Vet 6 (Sandra), Mascota 17 (Cleo)
(13, 2, 5, 18, '2030-12-23 09:00:00', 'Consultorio 2', 'aceptada'), -- Javier Ortiz (ID 13), Vet 5 (Mario), Mascota 18 (Rex)
(14, 1, 2, 19, '2030-04-23 11:00:00', 'Consultorio 1', 'rechazada'), -- Lucía Mendoza (ID 14), Vet 2 (Carlos), Mascota 19 (Molly)
(15, 5, 4, 20, '2030-07-24 10:00:00', 'Sala de Rayos X', 'aceptada'), -- Ricardo Vega (ID 15), Vet 4 (Laura), Mascota 20 (Duke)
(16, 6, 5, 10, '2030-06-24 15:30:00', 'Laboratorio', 'pendiente'); -- Patricia Castro (ID 16), Vet 5 (Mario), Mascota 10 (Toby)

-- Agrega citas para hoy usando CURDATE()
-- Asegúrate de que los id_mascota existan en tu tabla de mascotas
INSERT INTO citas (id_cliente, id_servicio, id_veterinario, id_mascota, fecha, servicios, estado) VALUES
(3, 1, 2, 1, CURDATE() + INTERVAL 1 HOUR, 'Consultorio 1', 'aceptada'), -- Juan Pérez (ID 3), Mascota 1 (Max)
(9, 2, 4, 3, CURDATE() + INTERVAL 2 HOUR, 'Consultorio 2', 'aceptada'), -- Alejandro Rojas (ID 9), Mascota 3 (Rocky)
(10, 3, 5, 4, CURDATE() + INTERVAL 3 HOUR, 'Sala de Estética', 'pendiente'); -- Gabriela Sánchez (ID 10), Mascota 4 (Milo)

-- Consultas de verificación
SELECT * FROM usuarios;
SELECT * FROM servicios;
SELECT * FROM mascotas;
SELECT * FROM historial_medico;
SELECT * FROM citas;
SELECT * FROM notificaciones;