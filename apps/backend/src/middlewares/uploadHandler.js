import multer from 'multer';
import path from 'path';

// 1. Configurar dónde y con qué nombre se guardan los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // La carpeta 'uploads/' debe existir en la raíz del proyecto
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Generar un nombre único: Fecha exacta + nombre original (evita que se sobreescriban)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// 2. Filtro de seguridad (Solo aceptar PDFs)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Acepta el archivo
  } else {
    // Rechaza si intentan subir una imagen o un .exe
    cb(new Error('Formato no válido. Solo se permiten archivos PDF.'), false); 
  }
};

// 3. Empaquetar la configuración
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de tamaño: 5MB máximo por archivo
});

export default upload;