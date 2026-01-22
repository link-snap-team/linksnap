"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  RotateCcw,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

type UploadResponse = {
  qrCodeUrl: string;
  publicFileUrl: string;
  downloadFileUrl?: string;
  qrTargetUrl?: string;
  originalFileName?: string;
  mimeType?: string;
};

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

function extractErrorMessage(data: unknown, status: number) {
  if (data && typeof data === "object") {
    const anyData = data as any;
    if (typeof anyData?.error === "string") return anyData.error;
    if (typeof anyData?.error?.message === "string") return anyData.error.message;
    if (typeof anyData?.message === "string") return anyData.message;
  }
  return `Erreur upload (${status})`;
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

  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setImagePreviewUrl(null);
    setTextPreview(null);

    if (!file) return;

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        setTextPreview(text.slice(0, 600));
      };
      reader.onerror = () => setTextPreview(null);
      reader.readAsText(file);
    }
  }, [file]);

  function reset() {
    setError(null);
    setResult(null);
    setFile(null);
    setImagePreviewUrl(null);
    setTextPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onPickFile(nextFile: File | null) {
    setError(null);
    setResult(null);
    setFile(nextFile);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      const msg = "Choisis un fichier (image, PDF ou TXT).";
      setError(msg);
      toast.error("Fichier manquant", { description: msg });
      return;
    }

    try {
      setIsLoading(true);

      const form = new FormData();
      form.append("file", file);

      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: "POST",
        body: form,
      });

      const data = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        const message = extractErrorMessage(data, response.status);
        setError(message);
        toast.error("Upload échoué", { description: message });
        return;
      }

      if (!data || typeof data !== "object") {
        setError("Réponse inattendue du serveur.");
        toast.error("Réponse inattendue");
        return;
      }

      const anyData = data as any;
      if (typeof anyData.publicFileUrl !== "string" || typeof anyData.qrCodeUrl !== "string") {
        setError("Réponse inattendue du serveur.");
        toast.error("Réponse inattendue", { description: "Champs manquants: publicFileUrl/qrCodeUrl" });
        return;
      }

      const nextResult: UploadResponse = {
        publicFileUrl: anyData.publicFileUrl,
        qrCodeUrl: anyData.qrCodeUrl,
        downloadFileUrl: typeof anyData.downloadFileUrl === "string" ? anyData.downloadFileUrl : undefined,
        qrTargetUrl: typeof anyData.qrTargetUrl === "string" ? anyData.qrTargetUrl : undefined,
        originalFileName: typeof anyData.originalFileName === "string" ? anyData.originalFileName : undefined,
        mimeType: typeof anyData.mimeType === "string" ? anyData.mimeType : undefined,
      };

      setResult(nextResult);
      toast.success("Upload terminé", { description: "Lien public et QR code générés." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur réseau.";
      setError(message);
      toast.error("Erreur réseau", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-zinc-200/60 to-transparent dark:from-zinc-900/60" />
      <main className="relative mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-900 text-white shadow-sm dark:bg-zinc-50 dark:text-zinc-950">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Linksnap</h1>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Lien public + QR code en quelques secondes.
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge>Images</Badge>
              <Badge>PDF</Badge>
              <Badge>TXT</Badge>
             
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" type="button" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload</CardTitle>
              <CardDescription>Glisse-dépose un fichier ou clique pour parcourir.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <input
                  ref={fileInputRef}
                  className="hidden"
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*,application/pdf,text/plain,.txt"
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={() => setIsDragging(true)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const next = e.dataTransfer.files?.[0] || null;
                    onPickFile(next);
                  }}
                  className={
                    "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-10 text-center transition-colors " +
                    (isDragging
                      ? "border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-950"
                      : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950")
                  }
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-medium">Choisir un fichier</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Formats: image, PDF, TXT</div>
                </button>

                {file ? (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{file.name}</div>
                          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {file.type || "unknown"} • {formatBytes(file.size)}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" type="button" onClick={() => onPickFile(null)}>
                        Retirer
                      </Button>
                    </div>

                    {imagePreviewUrl ? (
                      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreviewUrl} alt="Aperçu" className="max-h-64 w-full object-contain" />
                      </div>
                    ) : null}

                    {textPreview ? (
                      <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                        {textPreview}
                        {textPreview.length >= 600 ? "\n…" : ""}
                      </pre>
                    ) : null}
                  </div>
                ) : null}

                <Button type="submit" disabled={isLoading || !file} className="w-full">
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Upload…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Générer QR Code
                    </>
                  )}
                </Button>

                {error ? (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résultat</CardTitle>
              <CardDescription>Copie le lien, ouvre-le, ou partage via QR.</CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  Lance un upload pour obtenir un lien et un QR code.
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">Lien public</div>
                        <a
                          href={result.publicFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block break-all text-sm text-blue-700 underline underline-offset-4 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          {result.publicFileUrl}
                        </a>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={async () => {
                            try {
                              await copyToClipboard(result.publicFileUrl);
                              toast.success("Lien copié", { icon: <Check className="h-4 w-4" /> });
                            } catch {
                              toast.error("Impossible de copier le lien");
                            }
                          }}
                          aria-label="Copier le lien"
                          title="Copier le lien"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(result.publicFileUrl, "_blank", "noopener,noreferrer")}
                          aria-label="Ouvrir"
                          title="Ouvrir"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">QR Code</div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Scan pour ouvrir le lien.</div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => window.open(result.qrCodeUrl, "_blank", "noopener,noreferrer")}
                      >
                        Ouvrir l’image
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center justify-center rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={result.qrCodeUrl} alt="QR code" className="h-64 w-64 rounded-xl bg-white p-2" />
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                          try {
                            const url = result.qrTargetUrl || result.publicFileUrl;
                            await copyToClipboard(url);
                            toast.success("Lien du QR copié", { icon: <Check className="h-4 w-4" /> });
                          } catch {
                            toast.error("Impossible de copier");
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copier le lien du QR
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                          try {
                            const resp = await fetch(result.qrCodeUrl);
                            const blob = await resp.blob();
                            const a = document.createElement("a");
                            const objectUrl = URL.createObjectURL(blob);
                            a.href = objectUrl;
                            a.download = "linksnap-qr.png";
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(objectUrl);
                            toast.success("QR téléchargé");
                          } catch {
                            toast.error("Téléchargement impossible");
                          }
                        }}
                      >
                        Télécharger le QR
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Linksnap • Démo MVP (front + back séparés)
        </footer>
      </main>
    </div>
  );
}
