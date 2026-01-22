const { v2: cloudinary } = require("cloudinary");

let configured = false;

function assertEnv(name) {
  if (!process.env[name]) throw new Error(`Missing env var: ${name}`);
  return process.env[name];
}

function ensureConfigured() {
  if (configured) return;

  cloudinary.config({
    cloud_name: assertEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: assertEnv("CLOUDINARY_API_KEY"),
    api_secret: assertEnv("CLOUDINARY_API_SECRET")
  });

  configured = true;
}

// Expose helper while keeping backward-compatible default export.
cloudinary.ensureConfigured = ensureConfigured;

module.exports = cloudinary;
