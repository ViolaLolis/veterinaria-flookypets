DROP DATABASE IF EXISTS veterinaria;
CREATE DATABASE veterinaria;
USE veterinaria;

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL
);

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
    role VARCHAR(20) DEFAULT 'usuario',
    active TINYINT(1) DEFAULT 1 COMMENT '1=activo, 0=inactivo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(50),
    reset_token_expires DATETIME,
    experiencia VARCHAR(100), -- Nuevo campo
    universidad VARCHAR(150), -- Nuevo campo
    horario VARCHAR(255) -- Nuevo campo
);

CREATE TABLE mascotas (
    id_mascota INT AUTO_INCREMENT PRIMARY KEY,
    id_propietario INT NOT NULL,
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
    FOREIGN KEY (id_propietario) REFERENCES clientes(id_cliente)
);

CREATE TABLE historial_medico (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_mascota INT NOT NULL,
    fecha_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
    veterinario INT,
    diagnostico TEXT,
    tratamiento TEXT,
    observaciones TEXT,
    peso_actual DECIMAL(5,2),
    temperatura DECIMAL(4,2),
    proxima_cita DATE,
    FOREIGN KEY (id_mascota) REFERENCES mascotas(id_mascota),
    FOREIGN KEY (veterinario) REFERENCES usuarios(id)
);

CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    precio VARCHAR(50) NOT NULL
);

CREATE TABLE citas (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_servicio INT NOT NULL,
    id_veterinario INT,
    fecha DATETIME NOT NULL,
    servicios VARCHAR(255),
    estado ENUM('pendiente', 'aceptada', 'rechazada', 'completa', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
    FOREIGN KEY (id_veterinario) REFERENCES usuarios(id)
);

CREATE TABLE password_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
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
-- Contraseña '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze' es un placeholder seguro
INSERT INTO usuarios (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role, experiencia, universidad, horario) VALUES
('admin@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Admin', 'Principal', '3001234567', 'Calle Admin 123', 'CC', '123456789', '1980-01-01', 'admin', '10 AÑOS', 'UNIVERSIDAD NACIONAL DE COLOMBIA', 'LUNES A VIERNES: 8:00 AM - 5:00 PM'),
('vet@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Carlos', 'Veterinario', '3102345678', 'Carrera Vet 456', 'CC', '987654321', '1985-05-15', 'veterinario', '5 AÑOS', 'UNIVERSIDAD DE LOS ANDES', 'LUNES A SÁBADO: 9:00 AM - 6:00 PM'),
('user@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Juan', 'Pérez', '3203456789', 'Avenida Usuario 789', 'CC', '456123789', '1990-10-20', 'usuario', NULL, NULL, NULL);

-- Más usuarios existentes (veterinarios y administradores con datos nuevos)
INSERT INTO usuarios (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role, experiencia, universidad, horario) VALUES
('vet1@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Laura', 'Gómez', '3101234567', 'Calle Veterinaria 1', 'CC', '11223344', '1985-03-15', 'veterinario', '7 AÑOS', 'UNIVERSIDAD DE LA SALLE', 'LUNES, MIÉRCOLES, VIERNES: 8:00 AM - 4:00 PM'),
('vet2@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Mario', 'Hernández', '3152345678', 'Avenida Animales 2', 'CC', '22334455', '1988-07-22', 'veterinario', '5 AÑOS', 'UNIVERSIDAD JAVERIANA', 'MARTES, JUEVES: 10:00 AM - 7:00 PM'),
('vet3@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Sandra', 'Pérez', '3203456789', 'Carrera Mascotas 3', 'CC', '33445566', '1990-11-30', 'veterinario', '3 AÑOS', 'UNIVERSIDAD UDCA', 'SÁBADOS: 9:00 AM - 2:00 PM'),
('admin1@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Carolina', 'Díaz', '3004567890', 'Calle Recepción 4', 'CC', '44556677', '1992-05-18', 'admin', '8 AÑOS', 'UNIVERSIDAD NACIONAL DE COLOMBIA', 'LUNES A VIERNES: 9:00 AM - 6:00 PM'),
('admin2@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Roberto', 'Martínez', '3155678901', 'Avenida Ayudante 5', 'CC', '55667788', '1993-09-25', 'admin', '6 AÑOS', 'UNIVERSIDAD EXTERNADO', 'LUNES A SÁBADO: 8:30 AM - 5:30 PM');

-- Más usuarios de rol 'usuario'
INSERT INTO usuarios (email, password, nombre, apellido, telefono, direccion, tipo_documento, numero_documento, fecha_nacimiento, role) VALUES
('user1@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Alejandro', 'Rojas', '3206789012', 'Carrera Usuario 6', 'CC', '66778899', '1987-02-14', 'usuario'),
('user2@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Gabriela', 'Sánchez', '3007890123', 'Calle Cliente 7', 'CC', '77889900', '1995-08-03', 'usuario'),
('user3@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Felipe', 'Gutiérrez', '3158901234', 'Avenida Propietario 8', 'CC', '88990011', '1989-12-19', 'usuario'),
('user4@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Daniela', 'Castillo', '3209012345', 'Carrera Dueño 9', 'CC', '99001122', '1991-04-27', 'usuario'),
('user5@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Javier', 'Ortiz', '3000123456', 'Calle Mascotero 10', 'CC', '00112233', '1994-06-08', 'usuario'),
('user6@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Lucía', 'Mendoza', '3151234567', 'Avenida Animalista 11', 'CC', '11223344', '1986-10-15', 'usuario'),
('user7@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Ricardo', 'Vega', '3202345678', 'Carrera Pet 12', 'CC', '22334455', '1993-01-22', 'usuario'),
('user8@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Patricia', 'Castro', '3003456789', 'Calle Amante 13', 'CC', '33445566', '1988-07-30', 'usuario'),
('user9@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Hugo', 'Ríos', '3154567890', 'Avenida Cuidados 14', 'CC', '44556677', '1990-03-17', 'usuario'),
('user10@example.com', '$2a$10$xJwL5v5Jz5U5Z5U5Z5U5Ze', 'Camila', 'Navarro', '3205678901', 'Carrera Feliz 15', 'CC', '55667788', '1992-09-24', 'usuario');

-- Inserción de datos en clientes
INSERT INTO clientes (nombre, direccion, telefono) VALUES
('Juan Pérez', 'Calle Ficticia 123', '1234567890'),
('María Gómez', 'Avenida Ejemplo 456', '0987654321'),
('Carlos López', 'Plaza Principal 789', '1122334455'),
('Ana Martínez', 'Calle 123 #45-67', '3101112233'),
('Luis Rodríguez', 'Avenida Principal 890', '3152223344'),
('Sofía García', 'Carrera 56 #78-90', '3203334455'),
('Pedro Sánchez', 'Diagonal 12 #34-56', '3174445566'),
('María López', 'Calle 78 #90-12', '3005556677'),
('Carlos Ramírez', 'Avenida Central 345', '3116667788'),
('Laura Fernández', 'Carrera 78 #12-34', '3187778899'),
('Jorge González', 'Calle 90 #12-34', '3158889900'),
('Diana Torres', 'Avenida Norte 567', '3129990011'),
('Andrés Herrera', 'Carrera 34 #56-78', '3000001122'),
('Patricia Díaz', 'Calle 56 #78-90', '3141112233'),
('Ricardo Vargas', 'Avenida Sur 123', '3192223344'),
('Carmen Castro', 'Carrera 90 #12-34', '3173334455'),
('Fernando Rojas', 'Diagonal 56 #78-90', '3124445566'),
('Gloria Méndez', 'Calle 34 #56-78', '3185556677'),
('Oscar Quintero', 'Avenida Oriental 789', '3156667788'),
('Silvia Peña', 'Carrera 12 #34-56', '3007778899'),
('Mauricio Guzmán', 'Calle 67 #89-01', '3148889900'),
('Adriana Ruiz', 'Avenida Occidental 234', '3199990011'),
('Héctor Silva', 'Carrera 45 #67-89', '3170001122');

-- Inserción de datos en mascotas
INSERT INTO mascotas (id_propietario, nombre, especie, raza, edad, peso, fecha_nacimiento, color, sexo, microchip) VALUES
(1, 'Max', 'Perro', 'Labrador Retriever', 3, 28.5, '2020-05-10', 'Dorado', 'Macho', '123456789012345'),
(1, 'Luna', 'Gato', 'Siamés', 2, 4.2, '2021-03-15', 'Blanco y café', 'Hembra', '234567890123456'),
(2, 'Rocky', 'Perro', 'Bulldog Francés', 4, 12.3, '2019-01-20', 'Atigrado', 'Macho', '345678901234567'),
(3, 'Milo', 'Gato', 'Mestizo', 1, 3.8, '2022-07-05', 'Negro', 'Macho', NULL),
(4, 'Bella', 'Perro', 'Golden Retriever', 5, 30.0, '2018-11-12', 'Dorado', 'Hembra', '456789012345678'),
(5, 'Simba', 'Gato', 'Persa', 2, 5.1, '2021-02-28', 'Gris', 'Macho', '567890123456789'),
(6, 'Coco', 'Perro', 'Chihuahua', 7, 2.5, '2016-09-17', 'Café', 'Hembra', '678901234567890'),
(7, 'Leo', 'Perro', 'Pastor Alemán', 2, 35.0, '2021-04-22', 'Negro y café', 'Macho', '789012345678901'),
(8, 'Lola', 'Gato', 'Bengalí', 1, 4.5, '2022-08-30', 'Atigrado', 'Hembra', NULL),
(9, 'Toby', 'Perro', 'Beagle', 6, 15.0, '2017-12-05', 'Tricolor', 'Macho', '890123456789012'),
(10, 'Mia', 'Gato', 'Ragdoll', 3, 5.8, '2020-06-18', 'Blanco y gris', 'Hembra', '901234567890123'),
(11, 'Bruno', 'Perro', 'Boxer', 4, 32.0, '2019-03-25', 'Atigrado', 'Macho', '012345678901234'),
(12, 'Lily', 'Gato', 'Esfinge', 2, 3.9, '2021-10-10', 'Rosa', 'Hembra', NULL),
(13, 'Zeus', 'Perro', 'Husky Siberiano', 3, 25.0, '2020-01-15', 'Blanco y negro', 'Macho', '123450987654321'),
(14, 'Nala', 'Gato', 'Maine Coon', 1, 6.2, '2022-05-20', 'Atigrado', 'Hembra', '234561098765432'),
(15, 'Thor', 'Perro', 'Doberman', 5, 38.0, '2018-08-08', 'Negro y café', 'Macho', '345672109876543'),
(16, 'Cleo', 'Gato', 'Mestizo', 2, 4.0, '2021-07-12', 'Atigrado', 'Hembra', NULL),
(17, 'Rex', 'Perro', 'Rottweiler', 4, 42.0, '2019-04-03', 'Negro y café', 'Macho', '456783210987654'),
(18, 'Molly', 'Gato', 'Británico de Pelo Corto', 3, 5.5, '2020-09-25', 'Gris', 'Hembra', '567894321098765'),
(19, 'Duke', 'Perro', 'Gran Danés', 2, 50.0, '2021-11-30', 'Negro', 'Macho', '678905432109876');

-- Nuevas mascotas para los usuarios de rol 'usuario' existentes (user1 a user5)
INSERT INTO mascotas (id_propietario, nombre, especie, raza, edad, peso, fecha_nacimiento, color, sexo, microchip) VALUES
((SELECT id_cliente FROM clientes WHERE nombre = 'Alejandro Rojas'), 'Firulais', 'Perro', 'Criollo', 2, 10.5, '2022-01-01', 'Marrón', 'Macho', NULL),
((SELECT id_cliente FROM clientes WHERE nombre = 'Alejandro Rojas'), 'Whiskers', 'Gato', 'Europeo Común', 1, 3.0, '2023-03-10', 'Blanco y negro', 'Hembra', NULL),
((SELECT id_cliente FROM clientes WHERE nombre = 'Gabriela Sánchez'), 'Burbuja', 'Perro', 'Poodle', 4, 6.0, '2020-07-20', 'Blanco', 'Hembra', '987654321098765'),
((SELECT id_cliente FROM clientes WHERE nombre = 'Gabriela Sánchez'), 'Garfield', 'Gato', 'Común Europeo', 3, 5.5, '2021-04-05', 'Naranja', 'Macho', NULL),
((SELECT id_cliente FROM clientes WHERE nombre = 'Felipe Gutiérrez'), 'Manchas', 'Perro', 'Dálmata', 1, 18.0, '2023-02-15', 'Blanco y negro', 'Macho', '876543210987654'),
((SELECT id_cliente FROM clientes WHERE nombre = 'Felipe Gutiérrez'), 'Shadow', 'Gato', 'Bombay', 2, 4.0, '2022-09-01', 'Negro', 'Macho', NULL),
((SELECT id_cliente FROM clientes WHERE nombre = 'Daniela Castillo'), 'Princesa', 'Perro', 'Shih Tzu', 5, 5.0, '2019-11-11', 'Blanco y café', 'Hembra', '765432109876543'),
((SELECT id_cliente FROM clientes WHERE nombre = 'Daniela Castillo'), 'Kitty', 'Gato', 'Angora', 4, 3.5, '2020-08-22', 'Crema', 'Hembra', NULL),
((SELECT id_cliente FROM clientes WHERE nombre = 'Javier Ortiz'), 'Capitán', 'Perro', 'Pastor Collie', 3, 25.0, '2021-06-01', 'Tricolor', 'Macho', '654321098765432'),
((SELECT id_cliente FROM clientes WHERE nombre = 'Javier Ortiz'), 'Duquesa', 'Gato', 'Siberiano', 1, 4.8, '2023-05-01', 'Gris atigrado', 'Hembra', NULL);

-- Inserción de datos en historial_medico
INSERT INTO historial_medico (id_mascota, veterinario, diagnostico, tratamiento, observaciones, peso_actual, temperatura, proxima_cita) VALUES
(1, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), 'Control anual de salud', 'Vacuna antirrábica', 'Mascota en buen estado de salud', 28.5, 38.5, '2024-05-10'),
(2, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), 'Desparasitación', 'Tabletas antiparasitarias', 'Sin problemas detectados', 4.2, 38.7, '2023-09-15'),
(3, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), 'Problemas de piel', 'Shampoo medicado y antibióticos', 'Posible alergia alimentaria', 12.0, 39.0, '2023-07-20'),
(4, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), 'Castración', 'Postoperatorio controlado', 'Recuperación normal', 3.8, 38.5, '2023-08-05'),
(5, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), 'Control de peso', 'Dieta especial y ejercicio', 'Sobrepeso moderado', 30.5, 38.6, '2023-08-12'),
(6, (SELECT id FROM usuarios WHERE email = 'vet3@example.com'), 'Infección ocular', 'Gotas oftálmicas', 'Mejoría en 48 horas', 5.1, 38.9, '2023-07-28'),
(7, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), 'Control geriátrico', 'Suplementos articulares', 'Artritis incipiente', 2.4, 38.4, '2023-09-17'),
(8, (SELECT id FROM usuarios WHERE email = 'vet3@example.com'), 'Vacunación anual', 'Vacuna múltiple', 'Reacción normal', 35.2, 38.8, '2024-04-22'),
(9, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), 'Control de crecimiento', 'Alimentación balanceada', 'Desarrollo adecuado', 4.7, 38.6, '2023-10-30'),
(10, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), 'Problemas digestivos', 'Dieta blanda y probióticos', 'Posible intolerancia', 15.0, 39.1, '2023-08-05'),
(11, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), 'Control de esterilización', 'Postoperatorio', 'Recuperación sin complicaciones', 5.7, 38.5, '2023-09-18'),
(12, (SELECT id FROM usuarios WHERE email = 'vet3@example.com'), 'Dermatitis', 'Antihistamínicos y crema', 'Alergia ambiental', 3.8, 38.7, '2023-08-10'),
(13, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), 'Control de vacunas', 'Vacuna antirrábica y múltiple', 'Buen estado general', 25.3, 38.5, '2024-01-15'),
(14, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), 'Control de peso', 'Aumento de ración', 'Bajo peso para la raza', 6.5, 38.9, '2023-08-20'),
(15, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), 'Problemas articulares', 'Suplementos y antiinflamatorios', 'Displasia de cadera', 38.0, 38.7, '2023-09-08'),
(16, (SELECT id FROM usuarios WHERE email = 'vet3@example.com'), 'Control de salud', 'Desparasitación', 'Sin problemas detectados', 4.1, 38.5, '2023-10-12'),
(17, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), 'Herida en pata', 'Curación y antibióticos', 'Herida superficial', 42.0, 39.2, '2023-07-03'),
(18, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), 'Control dental', 'Limpieza dental', 'Sarro moderado', 5.4, 38.6, '2024-03-25'),
(19, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), 'Control de crecimiento', 'Alimentación para cachorro grande', 'Desarrollo adecuado', 52.0, 38.8, '2023-11-30');

-- Historial médico para las nuevas mascotas
INSERT INTO historial_medico (id_mascota, veterinario, diagnostico, tratamiento, observaciones, peso_actual, temperatura, proxima_cita) VALUES
((SELECT id_mascota FROM mascotas WHERE nombre = 'Firulais' AND id_propietario = (SELECT id_cliente FROM clientes WHERE nombre = 'Alejandro Rojas')), (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), 'Revisión general', 'Vacuna Parvovirus', 'Cachorro saludable', 10.0, 38.0, '2024-07-01'),
((SELECT id_mascota FROM mascotas WHERE nombre = 'Whiskers' AND id_propietario = (SELECT id_cliente FROM clientes WHERE nombre = 'Alejandro Rojas')), (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), 'Control de crecimiento', 'Dieta especial', 'Buen apetito', 2.8, 38.2, '2024-08-15'),
((SELECT id_mascota FROM mascotas WHERE nombre = 'Burbuja' AND id_propietario = (SELECT id_cliente FROM clientes WHERE nombre = 'Gabriela Sánchez')), (SELECT id FROM usuarios WHERE email = 'vet3@example.com'), 'Chequeo dental', 'Limpieza', 'Encías sanas', 5.9, 38.5, '2024-09-01');


-- Inserción de datos en citas
INSERT INTO citas (id_cliente, id_servicio, id_veterinario, fecha, servicios, estado) VALUES
(1, 1, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), '2030-06-15 09:00:00', 'Consultorio 1', 'aceptada'),
(2, 2, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), '2030-07-15 10:30:00', 'Consultorio 2', 'aceptada'),
(3, 3, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), '2030-07-16 11:00:00', 'Sala de Estética', 'aceptada'),
(4, 1, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), '2030-07-16 14:00:00', 'Consultorio 1', 'pendiente'),
(5, 2, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), '2030-02-17 09:30:00', 'Consultorio 2', 'aceptada'),
(6, 4, (SELECT id FROM usuarios WHERE email = 'vet3@example.com'), '2030-02-17 11:00:00', 'Quirófano', 'aceptada'),
(7, 5, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), '2030-03-18 10:00:00', 'Sala de Rayos X', 'pendiente'),
(8, 6, (SELECT id FROM usuarios WHERE email = 'vet3@example.com'), '2030-01-18 15:00:00', 'Laboratorio', 'aceptada'),
(9, 1, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), '2030-03-19 08:30:00', 'Consultorio 1', 'aceptada'),
(10, 3, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), '2030-05-19 13:00:00', 'Sala de Estética', 'pendiente'),
(11, 2, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), '2030-04-20 10:00:00', 'Consultorio 2', 'aceptada'),
(12, 5, (SELECT id FROM usuarios WHERE email = 'vet3@example.com'), '2030-08-20 11:30:00', 'Sala de Rayos X', 'aceptada'),
(13, 1, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), '2030-09-21 09:00:00', 'Consultorio 1', 'pendiente'),
(14, 4, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), '2030-12-21 14:00:00', 'Quirófano', 'aceptada'),
(15, 6, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), '2023-10-22 10:30:00', 'Laboratorio', 'aceptada'),
(16, 3, (SELECT id FROM usuarios WHERE email = 'vet3@example.com'), '2030-11-22 12:00:00', 'Sala de Estética', 'completa'),
(17, 2, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), '2030-12-23 09:00:00', 'Consultorio 2', 'aceptada'),
(18, 1, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), '2030-04-23 11:00:00', 'Consultorio 1', 'rechazada'),
(19, 5, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), '2030-07-24 10:00:00', 'Sala de Rayos X', 'aceptada'),
(20, 6, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), '2030-06-24 15:30:00', 'Laboratorio', 'pendiente');

-- Agrega citas para hoy usando CURDATE()
INSERT INTO citas (id_cliente, id_servicio, id_veterinario, fecha, servicios, estado) VALUES
(1, 1, (SELECT id FROM usuarios WHERE email = 'vet@example.com'), CURDATE() + INTERVAL 1 HOUR, 'Consultorio 1', 'aceptada'),
(2, 2, (SELECT id FROM usuarios WHERE email = 'vet1@example.com'), CURDATE() + INTERVAL 2 HOUR, 'Consultorio 2', 'aceptada'),
(3, 3, (SELECT id FROM usuarios WHERE email = 'vet2@example.com'), CURDATE() + INTERVAL 3 HOUR, 'Sala de Estética', 'pendiente');

INSERT INTO mascotas (id_propietario, nombre, especie, raza, edad, peso, fecha_nacimiento, color, sexo, microchip) VALUES
(1, 'Luna', 'Gato', 'Egipcio', 3, 5,3, '2021-05-12', 'Amarillo', 'Hembra', '12345678907890'),

-- Consultas de verificación
SELECT * FROM usuarios;
SELECT * FROM servicios;
SELECT * FROM clientes;
SELECT * FROM mascotas;
SELECT * FROM historial_medico;
SELECT * FROM citas;