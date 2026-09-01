IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'sonrisa_del_manana_db')
BEGIN
    CREATE DATABASE sonrisa_del_manana_db;
END;
GO

USE sonrisa_del_manana_db;
GO

-- 2. Tabla PACIENTE
CREATE TABLE PACIENTE (
    id_paciente INT IDENTITY(1,1) PRIMARY KEY,
    ci VARCHAR(15) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    direccion VARCHAR(150),
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE()
);

-- 3. Tabla ODONTOGRAMA
CREATE TABLE ODONTOGRAMA (
    id_odontograma INT IDENTITY(1,1) PRIMARY KEY,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    observaciones_generales VARCHAR(MAX),
    id_paciente INT NOT NULL,
    CONSTRAINT fk_odontograma_paciente FOREIGN KEY (id_paciente) 
        REFERENCES PACIENTE(id_paciente) ON DELETE NO ACTION ON UPDATE CASCADE
);

-- 4. Tabla DETALLE_DIENTE
CREATE TABLE DETALLE_DIENTE (
    id_detalle_diente INT IDENTITY(1,1) PRIMARY KEY,
    numero_diente INT NOT NULL,
    cara_diente VARCHAR(20) NOT NULL,
    condicion_hallada VARCHAR(100) NOT NULL,
    id_odontograma INT NOT NULL,
    CONSTRAINT chk_numero_diente CHECK (numero_diente BETWEEN 11 AND 85),
    CONSTRAINT chk_cara_diente CHECK (cara_diente IN ('Vestibular', 'Palatino/Lingual', 'Ocusal/Incisal', 'Mesial', 'Distal', 'General')),
    CONSTRAINT fk_detalle_odontograma FOREIGN KEY (id_odontograma) 
        REFERENCES ODONTOGRAMA(id_odontograma) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Tabla CITAS
CREATE TABLE CITAS (
    id_cita INT IDENTITY(1,1) PRIMARY KEY,
    fecha_hora_inicio DATETIME NOT NULL,
    fecha_hora_fin DATETIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    motivo_consulta VARCHAR(255) NOT NULL,
    id_paciente INT NOT NULL,
    CONSTRAINT chk_cita_estado CHECK (estado IN ('Pendiente', 'Atendida', 'Cancelada')),
    CONSTRAINT fk_cita_paciente FOREIGN KEY (id_paciente) 
        REFERENCES PACIENTE(id_paciente) ON DELETE NO ACTION ON UPDATE CASCADE
);

-- 6. Tabla PLAN_TRATAMIENTO
CREATE TABLE PLAN_TRATAMIENTO (
    id_plan INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(MAX) NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL,
    estado_plan VARCHAR(20) NOT NULL DEFAULT 'Propuesto',
    fecha_inicio DATE NOT NULL,
    id_paciente INT NOT NULL,
    id_cita INT NULL,
    CONSTRAINT chk_costo_total CHECK (costo_total > 0),
    CONSTRAINT chk_estado_plan CHECK (estado_plan IN ('Propuesto', 'En Proceso', 'Concluido', 'Cancelado')),
    CONSTRAINT fk_plan_paciente FOREIGN KEY (id_paciente) 
        REFERENCES PACIENTE(id_paciente) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_plan_cita FOREIGN KEY (id_cita) 
        REFERENCES CITAS(id_cita) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 7. Tabla PAGOS_ABONOS
CREATE TABLE PAGOS_ABONOS (
    id_pago INT IDENTITY(1,1) PRIMARY KEY,
    fecha_pago DATETIME NOT NULL DEFAULT GETDATE(),
    monto_abonado DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    id_plan INT NOT NULL,
    CONSTRAINT chk_monto_abonado CHECK (monto_abonado > 0),
    CONSTRAINT chk_metodo_pago CHECK (metodo_pago IN ('Efectivo', 'QR', 'Tarjeta', 'Transferencia')),
    CONSTRAINT fk_pago_plan FOREIGN KEY (id_plan) 
        REFERENCES PLAN_TRATAMIENTO(id_plan) ON DELETE NO ACTION ON UPDATE CASCADE
);