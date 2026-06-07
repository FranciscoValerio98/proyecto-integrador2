export class apiResponse {
  static success(res, { data, message = 'Operacion Exitosa', meta } = {}) {
    return res.status(200).json({
      success: true,
      message,
      data,
      ...(meta && { meta }),
    });
  }

  static created(res, { data, message = 'Recurso creado exitosamente' } = {}) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static error(res, optionsOrMessage, statusCodeOverride) {
    const isString = typeof optionsOrMessage === 'string';
    const message = isString ? optionsOrMessage : (optionsOrMessage?.message || 'Error interno del servidor');
    const status = isString ? (statusCodeOverride || 500) : (optionsOrMessage?.status || 500);
    const details = isString ? undefined : optionsOrMessage?.details;

    return res.status(status).json({
      success: 'error',
      message,
      ...(details && { details }),
    });
  }
}
