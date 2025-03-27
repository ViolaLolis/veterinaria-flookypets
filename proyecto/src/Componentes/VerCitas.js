import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../Styles/VerCitas.css";

function VerCitas() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [citasEncontradas, setCitasEncontradas] = useState(null);

    const buscarCitas = (data) => {
        console.log(`Buscando citas para la mascota: ${data.nombreMascota}, dueño con cédula: ${data.cedula}`);
        setCitasEncontradas(`Mascota: ${data.nombreMascota} - Dueño: ${data.cedula}`);
    };

    return (
        <div className="form-container">
            <h2>Consultar Citas Médicas</h2>
            <form onSubmit={handleSubmit(buscarCitas)}>
                <label>Nombre de la Mascota:</label>
                <input
                    type="text"
                    {...register("nombreMascota", { 
                        required: "Este campo es obligatorio",
                        minLength: {
                            value: 2,
                            message: "Debe tener al menos 2 caracteres"
                        },
                        maxLength: {
                            value: 20,
                            message: "No puede tener más de 20 caracteres"
                        }
                    })}
                    placeholder="Ej: Firulais"
                />
                {errors.nombreMascota && <p className="error">{errors.nombreMascota.message}</p>}

                <label>Número de Cédula del Dueño:</label>
                <input
                    type="text"
                    {...register("cedula", { 
                        required: "Este campo es obligatorio",
                        pattern: {
                            value: /^[0-9]+$/,
                            message: "Solo se permiten números"
                        },
                        minLength: {
                            value: 7,
                            message: "Debe tener al menos 7 dígitos"
                        },
                        maxLength: {
                            value: 10,
                            message: "No puede tener más de 10 dígitos"
                        }
                    })}
                    placeholder="Ej: 12345678"
                />
                {errors.cedula && <p className="error">{errors.cedula.message}</p>}
                
                <button type="submit">Buscar</button>
            </form>

            {citasEncontradas && (
                <div className="citas-medicas">
                    <h3>Estas son tus citas médicas disponibles:</h3>
                    <p>{citasEncontradas}</p>
                </div>
            )}
        </div>
    );
}

export default VerCitas;