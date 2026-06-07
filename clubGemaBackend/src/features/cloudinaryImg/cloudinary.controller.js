import { cloudinaryService } from './cloudinary.service.js';
import { catchAsync } from '../../shared/utils/catchAsync.util.js';
import { apiResponse } from '../../shared/utils/response.util.js';
import { ApiError } from '../../shared/utils/error.util.js';

export const cloudinaryController = {
  upload: catchAsync(async (req, res) => {
    if (!req.file) {
      throw new ApiError('No se ha subido ningún archivo', 400);
    }

    const resultado = await cloudinaryService.upload(req.file, req.body.folderName);

    return apiResponse.success(res, {
      message: 'Imagen subida exitosamente',
      data: resultado,
    });
  }),
};
