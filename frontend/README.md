# Linksnap Frontend

Interface web responsive (Next.js) : upload d’un fichier (image/PDF), appel à l’API backend `/upload`, affichage du lien public + QR Code.

## Variables d’environnement

Créer un `.env.local` (ou partir de `.env.example`) :

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

Exemple avec ton backend (devtunnel) :

```
NEXT_PUBLIC_API_BASE_URL=https://qrfb0k7m-3001.euw.devtunnels.ms
```

En prod (Vercel), définir `NEXT_PUBLIC_API_BASE_URL` vers le domaine du backend.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

## Dépannage

- Si tu changes `.env.local`, redémarre `npm run dev`.
- Si l’upload échoue avec une erreur CORS, c’est côté backend (il doit autoriser l’origine `http://localhost:3000`).

