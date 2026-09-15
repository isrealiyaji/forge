const multer = require("multer");

// Memory storage: the buffer is streamed straight to Cloudinary in
// uploadService, never written to local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
