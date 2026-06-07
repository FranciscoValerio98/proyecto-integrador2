import { parametrosService } from './parametros.service.js';

export const parametrosController = {
    listar: async (req, res) => {
        try {
            const data = await parametrosService.obtenerTodos();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    obtenerClave: async (req, res) => {
        try {
            const { clave } = req.params;
            const data = await parametrosService.obtenerPorClave(clave);
            if (!data) return res.status(404).json({ success: false, message: "Parámetro no encontrado" });
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    crear: async (req, res) => {
        try {
            const data = await parametrosService.crear(req.body);
            res.status(201).json({ success: true, message: "Parámetro creado", data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    actualizar: async (req, res) => {
        try {
            const data = await parametrosService.actualizar(req.params.id, req.body);
            res.json({ success: true, message: "Parámetro actualizado", data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    eliminar: async (req, res) => {
        try {
            await parametrosService.eliminar(req.params.id);
            res.json({ success: true, message: "Parámetro eliminado" });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
};