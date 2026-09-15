const asyncHandler = require("../lib/asyncHandler.js");
const AppError = require("../lib/AppError.js");
const uploadService = require("../services/uploadService.js");

const profilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded.", 422);
  const url = await uploadService.uploadProfilePhoto(req.file.buffer, req.user.id);
  res.json({ url });
});

module.exports = { profilePhoto };
