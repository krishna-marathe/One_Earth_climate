const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const authController = require('../controllers/authController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Upload dataset
router.post('/dataset', authController.authenticateToken, upload.single('dataset'), uploadController.uploadDataset);

// Get upload history
router.get('/history', authController.authenticateToken, uploadController.getUploadHistory);

// Delete uploaded file
router.delete('/:uploadId', authController.authenticateToken, uploadController.deleteUpload);

module.exports = router;