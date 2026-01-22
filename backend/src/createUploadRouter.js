const express = require("express");
const multer = require("multer");
const QRCode = require("qrcode");
const cloudinary = require("./cloudinary");
const uploadBufferToCloudinary = require("./uploadBufferToCloudinary");

function mbToBytes(mb) {
  return Math.floor(Number(mb || 10) * 1024 * 1024);
}

function createUploadRouter() {
  const router = express.Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: mbToBytes(process.env.MAX_FILE_SIZE_MB) }
  });

  router.post("/", upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: { message: "Missing file field 'file'." } });
      }

      cloudinary.ensureConfigured();

      const folderBase = process.env.CLOUDINARY_FOLDER || "linksnap";
      const uploadsFolder = `${folderBase}/uploads`;
      const qrFolder = `${folderBase}/qrcodes`;

      const publicId = `file_${Date.now()}_${Math.random().toString(16).slice(2)}`;

      // IMPORTANT: Cloudinary => image pour images, raw pour PDF et tout le reste
      const isImage = req.file.mimetype && req.file.mimetype.startsWith("image/");
      const resourceType = isImage ? "image" : "raw";

      const uploaded = await uploadBufferToCloudinary({
        buffer: req.file.buffer,
        folder: uploadsFolder,
        publicId,
        resourceType
      });

      const publicFileUrl = uploaded.secure_url;

      // Optionnel mais utile sur mobile: force le téléchargement
      const downloadFileUrl = publicFileUrl.replace("/upload/", "/upload/fl_attachment/");

      const qrDataUrl = await QRCode.toDataURL(downloadFileUrl, {
        errorCorrectionLevel: "M",
        width: 512,
        margin: 1
      });

      const qrUploaded = await cloudinary.uploader.upload(qrDataUrl, {
        folder: qrFolder,
        resource_type: "image",
        public_id: `qr_${publicId}`,
        overwrite: false
      });

      return res.status(200).json({
        publicFileUrl,
        downloadFileUrl,
        qrCodeUrl: qrUploaded.secure_url,
        originalFileName: req.file.originalname,
        mimeType: req.file.mimetype
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createUploadRouter;
