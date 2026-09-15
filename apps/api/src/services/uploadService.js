const cloudinary = require("../lib/cloudinaryClient.js");

const uploadBuffer = (buffer, { folder }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
    stream.end(buffer);
  });

const uploadProfilePhoto = async (fileBuffer, userId) => {
  const result = await uploadBuffer(fileBuffer, { folder: `forge/profile-photos/${userId}` });
  return result.secure_url;
};

const uploadNutritionAttachment = async (fileBuffer, planId) => {
  const result = await uploadBuffer(fileBuffer, { folder: `forge/nutrition-plans/${planId}` });
  return result.secure_url;
};

module.exports = { uploadProfilePhoto, uploadNutritionAttachment };
