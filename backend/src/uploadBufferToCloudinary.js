const streamifier = require("streamifier");
const cloudinary = require("./cloudinary");

function uploadBufferToCloudinary({ buffer, folder, publicId, resourceType }) {
  cloudinary.ensureConfigured();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false,
        unique_filename: true
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

module.exports = uploadBufferToCloudinary;
