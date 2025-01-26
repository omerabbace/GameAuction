// src/utils/imageUploadUtils.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

class ImageUploadUtils {
  // Configure multer storage
  static storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../public/uploads');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  // File filter for image uploads
  static fileFilter = (req, file, cb) => {
    // Accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  };

  // Image upload middleware
  static upload = multer({
    storage: this.storage,
    fileFilter: this.fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
  });

  // Delete existing image
  static deleteImage(filename) {
    const imagePath = path.join(__dirname, '../../public/uploads', filename);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      return true;
    }
    
    return false;
  }

  // Get image URL
  static getImageUrl(filename) {
    return `/uploads/${filename}`;
  }

  // Validate and process image upload
  static async processImageUpload(req, res, next) {
    try {
      // Use multer upload middleware
      this.upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          return next(new Error(`Upload error: ${err.message}`));
        } else if (err) {
          // An unknown error occurred
          return next(err);
        }

        // No file uploaded
        if (!req.file) {
          return next(new Error('No image uploaded'));
        }

        // Add image details to request
        req.imageDetails = {
          filename: req.file.filename,
          path: req.file.path,
          url: this.getImageUrl(req.file.filename)
        };

        next();
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ImageUploadUtils;
