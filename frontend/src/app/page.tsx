"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

type UploadResponse = {
  qrCodeUrl: string;
  publicFileUrl: string;
};

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

export default function Home() {
  const apiBaseUrl = useMemo(() => {
    const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
    return normalizeBaseUrl(fromEnv || "http://localhost:3001");
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Choisis un fichier (image ou PDF).");
      return;
    }

    try {
      setIsLoading(true);

      const form = new FormData();
      form.append("file", file);

      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: "POST",
        body: form
      });

      const data = (await response.json().catch(() => null)) as
        | UploadResponse
        | { error?: string }
        | null;

      if (!response.ok) {
        const message = (data && "error" in data && data.error) || `Erreur upload (${response.status})`;
        setError(message);
        return;
      }

      if (!data || !("publicFileUrl" in data) || !("qrCodeUrl" in data)) {
        setError("Réponse inattendue du serveur.");
        return;
      }

      setResult({ publicFileUrl: data.publicFileUrl, qrCodeUrl: data.qrCodeUrl });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur réseau.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Linksnap</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            Upload une image, un PDF ou un fichier texte, puis récupère un lien public et un QR code.
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            API: <span className="font-mono">{apiBaseUrl}</span>
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="file">
                Fichier (image / PDF / TXT)
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept="image/*,application/pdf,text/plain,.txt"
                onChange={(e) => {
                  setError(null);
                  setResult(null);
                  setFile(e.target.files?.[0] || null);
                }}
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:file:bg-zinc-800 dark:hover:file:bg-zinc-700"
              />
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Taille max dépend du backend. Formats: image/*, PDF, TXT.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !file}
              className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {isLoading ? "Upload…" : "Générer QR Code"}
            </button>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            ) : null}
          </form>
        </section>

        {result ? (
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="text-lg font-semibold">Lien public</h2>
              <a
                href={result.publicFileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block break-all text-sm text-blue-700 underline underline-offset-4 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
              >
                {result.publicFileUrl}
              </a>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <h2 className="text-lg font-semibold">QR Code</h2>
              <div className="mt-4 flex items-center justify-center rounded-xl bg-white p-4 dark:bg-zinc-50">
                <img
                  src={result.qrCodeUrl}
                  alt="QR code vers le fichier"
                  className="h-56 w-56"
                />
              </div>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Astuce: scanne le QR code pour ouvrir le lien.
              </p>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
