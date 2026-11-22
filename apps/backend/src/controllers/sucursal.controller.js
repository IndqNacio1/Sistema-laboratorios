import { ILike } from "typeorm";
import { AppDataSource } from "../config/db.js";
import { SucursalSchema } from "../entities/sucursal.js";

const obtenerRepositorio = () => AppDataSource.getRepository(SucursalSchema);

export const crearSucursal = async (req, res) => {
    try {
        const { nombre, direccion, telefono } = req.body;

        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({ error: "El nombre de la sucursal es obligatorio." });
        }
        if (!direccion || direccion.trim() === "") {
            return res.status(400).json({ error: "La dirección es obligatoria." });
        }

        const nombreLimpio = nombre.trim();
        const sucursalRepository = obtenerRepositorio();

        const sucursalExistente = await sucursalRepository.findOne({
            where: { nombre: ILike(nombreLimpio) }
        });
        if (sucursalExistente) {
            return res.status(409).json({ error: "Ya existe una sucursal con este nombre." });
        }

        const nuevaSucursal = sucursalRepository.create({
            nombre: nombreLimpio,
            direccion: direccion.trim(),
            telefono: telefono ? telefono.trim() : null,
            activa: true
        });
        const resultado = await sucursalRepository.save(nuevaSucursal);

        return res.status(201).json({ mensaje: "Sucursal creada con éxito", datos: resultado });
    } catch (error) {
        console.error("Error al crear sucursal:", error);
        return res.status(500).json({ error: "Error interno del servidor al crear la sucursal." });
    }
};

export const obtenerSucursales = async (req, res) => {
    try {
        const sucursalRepository = obtenerRepositorio();
        const sucursales = await sucursalRepository.find({
            where: { activa: true },
            order: { id: "ASC" }
        });

        return res.status(200).json(sucursales);
    } catch (error) {
        console.error("Error al obtener sucursales:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

export const obtenerSucursalPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "El ID de la sucursal debe ser numérico." });
        }

        const sucursalRepository = obtenerRepositorio();
        const sucursal = await sucursalRepository.findOne({ where: { id } });

        if (!sucursal) {
            return res.status(404).json({ error: "Sucursal no encontrada." });
        }

        return res.status(200).json(sucursal);
    } catch (error) {
        console.error("Error al obtener sucursal:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

export const actualizarSucursal = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "El ID de la sucursal debe ser numérico." });
        }

        const { nombre, direccion, telefono, activa } = req.body;
        const sucursalRepository = obtenerRepositorio();
        const sucursal = await sucursalRepository.findOne({ where: { id } });

        if (!sucursal) {
            return res.status(404).json({ error: "Sucursal no encontrada." });
        }

        if (nombre !== undefined) {
            const nombreLimpio = nombre.trim();
            if (!nombreLimpio) {
                return res.status(400).json({ error: "El nombre no puede quedar vacío." });
            }
            const duplicada = await sucursalRepository.findOne({
                where: { nombre: ILike(nombreLimpio) }
            });
            if (duplicada && duplicada.id !== id) {
                return res.status(409).json({ error: "Ya existe otra sucursal con este nombre." });
            }
            sucursal.nombre = nombreLimpio;
        }

        if (direccion !== undefined) {
            if (!direccion.trim()) {
                return res.status(400).json({ error: "La dirección no puede quedar vacía." });
            }
            sucursal.direccion = direccion.trim();
        }

        if (telefono !== undefined) {
            sucursal.telefono = telefono ? telefono.trim() : null;
        }

        if (typeof activa === "boolean") {
            sucursal.activa = activa;
        }

        const actualizada = await sucursalRepository.save(sucursal);
        return res.status(200).json({ mensaje: "Sucursal actualizada con éxito", datos: actualizada });
    } catch (error) {
        console.error("Error al actualizar sucursal:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};

export const desactivarSucursal = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "El ID de la sucursal debe ser numérico." });
        }

        const sucursalRepository = obtenerRepositorio();
        const sucursal = await sucursalRepository.findOne({ where: { id } });

        if (!sucursal) {
            return res.status(404).json({ error: "Sucursal no encontrada." });
        }

        sucursal.activa = false;
        await sucursalRepository.save(sucursal);

        return res.status(200).json({ mensaje: "Sucursal desactivada correctamente.", id });
    } catch (error) {
        console.error("Error al desactivar sucursal:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
};