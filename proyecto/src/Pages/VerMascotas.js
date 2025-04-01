import React, { useState } from "react";
import { useForm } from "react-hook-form";

import "../Styles/VerMascotas.css";

function VerMascotas() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [mascotaEncontrada, setMascotaEncontrada] = useState(null);

    const buscarMascota = (data) => {
        console.log(`Buscando mascota ${data.nombreMascota}, dueño con cédula: ${data.cedula}`);
        setMascotaEncontrada(`Mascota: ${data.nombreMascota} - Dueño: ${data.cedula}`);
    };

    return (
        <div className="form-container">
            <h2>Consultar Mascotas Registradas</h2>
            <form onSubmit={handleSubmit(buscarMascota)}>
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

            {mascotaEncontrada && (
                <div className="mascotas-registradas">
                    <h3>Estas son tus mascotas registradas:</h3>
                    <p>{mascotaEncontrada}</p>
                </div>
            )}
        </div>
    );
}

export default VerMascotas;