import { TiposBeneficioService } from './tipos_beneficio.service.js';

export const TiposBeneficioController = {
  async crear(req, res) {
    try {
      const result = await TiposBeneficioService.create(req.body);
      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, message: "Error al crear tipo" });
    }
  },

  async listar(req, res) {
    try {
      const result = await TiposBeneficioService.getAll();
      res.json({ ok: true, data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, message: "Error al listar tipos" });
    }
  },
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const result = await TiposBeneficioService.update(id, req.body);
      res.json({ ok: true, data: result });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Error al actualizar tipo" });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      await TiposBeneficioService.delete(id);
      res.json({ ok: true, message: "Tipo de beneficio eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Error al eliminar tipo" });
    }
  }
};