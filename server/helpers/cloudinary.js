const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();
/*
This creates a storage configuration for Multer that stores uploaded files in memory (RAM) instead of saving them to disk.

What this means:
Files are stored as Buffer objects in memory
No temporary files created on disk
Perfect for cloud uploads (like Cloudinary)
Files accessible via req.file.buffer

*/

async function imageUploadUtils(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto", // cloudinary file detects the file type automatically
  });

  return result;
}

const upload = multer({ storage });
// used in router to upload
module.exports = { upload, imageUploadUtils };
