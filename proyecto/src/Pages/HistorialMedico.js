import React, { useState } from "react";
import { useForm } from "react-hook-form";

import "../Styles/HistorialMedico.css";

function HistorialMedico() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [result, setResult] = useState(null);

    const buscarHistorial = (data) => {
        console.log(`Buscando historial médico para la mascota ${data.nombreMascota} con dueño de cédula: ${data.cedula}`);
        setResult(`Historial médico encontrado para ${data.nombreMascota}, dueño con cédula: ${data.cedula}`);
    };

    return (
        <div className="form-container">
            <h2>Consultar Historial Médico</h2>
            <form onSubmit={handleSubmit(buscarHistorial)}>
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

            {result && <div className="result">{result}</div>}
        </div>
    );
}

export default HistorialMedico;