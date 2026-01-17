const { v2: cloudinary } = require("cloudinary");

function assertEnv(name) {
  if (!process.env[name]) throw new Error(`Missing env var: ${name}`);
  return process.env[name];
}

cloudinary.config({
  cloud_name: assertEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: assertEnv("CLOUDINARY_API_KEY"),
  api_secret: assertEnv("CLOUDINARY_API_SECRET")
});

module.exports = cloudinary;
