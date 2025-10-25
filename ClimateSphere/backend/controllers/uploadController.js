const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const fileCleaner = require('../utils/fileCleaner');

// Upload and process dataset
exports.uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { filename, originalname, size, path: filePath } = req.file;

    // Add upload record to user
    const user = await User.findById(req.userId);
    user.uploads.push({
      filename: originalname,
      uploadDate: new Date(),
      fileSize: size,
      status: 'processing'
    });
    await user.save();

    // Process and clean the file
    try {
      const cleanedData = await fileCleaner.processFile(filePath);
      
      // Update upload status
      const uploadIndex = user.uploads.length - 1;
      user.uploads[uploadIndex].status = 'completed';
      await user.save();

      res.json({
        message: 'File uploaded and processed successfully',
        filename: originalname,
        size,
        cleanedRows: cleanedData.rowCount,
        columns: cleanedData.columns,
        summary: cleanedData.summary
      });
    } catch (cleaningError) {
      // Update upload status to failed
      const uploadIndex = user.uploads.length - 1;
      user.uploads[uploadIndex].status = 'failed';
      await user.save();

      throw cleaningError;
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed: ' + error.message });
  }
};

// Get user's upload history
exports.getUploadHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('uploads');
    res.json(user.uploads || []);
  } catch (error) {
    console.error('Upload history error:', error);
    res.status(500).json({ error: 'Failed to fetch upload history' });
  }
};

// Delete uploaded file
exports.deleteUpload = async (req, res) => {
  try {
    const { uploadId } = req.params;
    const user = await User.findById(req.userId);
    
    const uploadIndex = user.uploads.findIndex(upload => upload._id.toString() === uploadId);
    if (uploadIndex === -1) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    user.uploads.splice(uploadIndex, 1);
    await user.save();

    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
};