import multer from 'multer';

// Allowed file types for document uploads
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'text/csv',
];

// Allowed file types for video uploads
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/x-matroska',
];

// Allowed file types for Excel imports
const ALLOWED_IMPORT_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

// File size limits
const FILE_SIZE_LIMITS = {
  document: 50 * 1024 * 1024,  // 50MB
  video: 500 * 1024 * 1024,     // 500MB
  import: 10 * 1024 * 1024,     // 10MB
  image: 10 * 1024 * 1024,      // 10MB
};

// Use memory storage (buffers) for Cloudinary upload
const storage = multer.memoryStorage();

/**
 * Create a multer filter for specific MIME types
 */
const createTypeFilter = (allowedTypes, typeName) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${typeName} files are allowed.`), false);
    }
  };
};

/**
 * Document upload middleware
 * Accepts: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, images
 */
export const uploadDocument = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMITS.document },
  fileFilter: createTypeFilter(ALLOWED_DOCUMENT_TYPES, 'document (PDF, DOC, PPT, XLS, ZIP, images)'),
});

/**
 * Video upload middleware
 * Accepts: MP4, MPEG, MOV, AVI, WebM, MKV
 */
export const uploadVideo = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMITS.video },
  fileFilter: createTypeFilter(ALLOWED_VIDEO_TYPES, 'video (MP4, MPEG, MOV, AVI, WebM)'),
});

/**
 * Excel/CSV import upload middleware
 * Accepts: XLS, XLSX, CSV
 */
export const uploadImport = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMITS.import },
  fileFilter: createTypeFilter(ALLOWED_IMPORT_TYPES, 'spreadsheet (XLS, XLSX, CSV)'),
});

/**
 * Generic upload middleware (accepts any file type)
 */
export const uploadAny = multer({
  storage,
  limits: { fileSize: FILE_SIZE_LIMITS.document },
});

/**
 * Error handler middleware for multer errors
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Please check size limits.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};
