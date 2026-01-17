const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

app.post('/upload', (_req, res) => {
  // Return a stable mock response so the frontend can display a link + QR code.
  const publicFileUrl = 'https://example.com/sample-file.png';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
    publicFileUrl
  )}`;

  res.json({ publicFileUrl, qrCodeUrl });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Mock backend listening on http://localhost:${PORT}`));
