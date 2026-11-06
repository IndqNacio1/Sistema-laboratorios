import { AppDataSource } from "../config/db.js";
import { EntitySchema } from "typeorm";

// Obtenemos el repositorio usando el nombre que le dimos en el esquema
const obtenerRepositorio = () => AppDataSource.getRepository("Sucursal");

export const crearSucursal = async (req, res) => {
    try {
        const { nombre, direccion, telefono } = req.body;

        // Validación de datos (Actividad reportada)
        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({ error: "El nombre de la sucursal es obligatorio." });
        }
        if (!direccion || direccion.trim() === "") {
            return res.status(400).json({ error: "La dirección es obligatoria." });
        }

        const sucursalRepository = obtenerRepositorio();
        
        // Regla de negocio: Evitar duplicados
        const sucursalExistente = await sucursalRepository.findOne({ where: { nombre } });
        if (sucursalExistente) {
            return res.status(409).json({ error: "Ya existe una sucursal con este nombre." });
        }

        const nuevaSucursal = sucursalRepository.create({ nombre, direccion, telefono });
        const resultado = await sucursalRepository.save(nuevaSucursal);

        res.status(201).json({ mensaje: "Sucursal creada con éxito", datos: resultado });
    } catch (error) {
        console.error("Error al crear sucursal:", error);
        res.status(500).json({ error: "Error interno del servidor al crear la sucursal." });
    }
};

export const obtenerSucursales = async (req, res) => {
    try {
        const sucursalRepository = obtenerRepositorio();
        const sucursales = await sucursalRepository.find({ where: { activa: true } });
        
        res.status(200).json(sucursales);
    } catch (error) {
        console.error("Error al obtener sucursales:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};