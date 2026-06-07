import multer from 'multer';

// Le decimos a Multer que guarde el archivo en la memoria RAM temporalmente (Buffer)
const storage = multer.memoryStorage();

export const uploadMemory = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de tamaño: 5MB máximo por foto
  },
  fileFilter: (req, file, cb) => {
    // Filtro de seguridad: Solo aceptamos archivos que sean imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato no válido. Solo se permiten imágenes.'), false);
    }
  }
});