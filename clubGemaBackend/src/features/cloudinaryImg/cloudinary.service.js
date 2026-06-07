import { cloudinary } from '../../config/cloudinary.config.js';
import { ApiError } from '../../shared/utils/error.util.js';

export const cloudinaryService = {
  upload: async (fileObject, folderName) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folderName,
          public_id: `${Date.now()}_${fileObject.originalname.replace(/\.[^/.]+$/, '')}`,
        },
        (error, result) => {
          if (error) {
            reject(new ApiError('Error al subir imagen a Cloudinary', 500));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
            });
          }
        }
      );

      uploadStream.end(fileObject.buffer);
    });
  },
};
