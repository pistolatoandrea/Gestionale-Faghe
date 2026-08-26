"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ImageOff, Upload } from "lucide-react";
import { toast } from "sonner";
import { deleteInterventoFoto, recordInterventoFoto } from "@/app/(dashboard)/interventi/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

const MAX_FOTO_SIZE = 15 * 1024 * 1024;
const FOTO_BUCKET = "intervento-foto";

export interface InterventoFotoItem {
  id: string;
  url: string;
  nomeFile: string | null;
}

export function InterventoFotoGallery({
  interventoId,
  foto,
}: {
  interventoId: string;
  foto: InterventoFotoItem[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, startUploading] = useTransition();
  const [deleting, startDeleting] = useTransition();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`Il file "${file.name}" non è un'immagine.`);
        return;
      }
      if (file.size > MAX_FOTO_SIZE) {
        toast.error(`Il file "${file.name}" supera i 15MB.`);
        return;
      }
    }

    startUploading(async () => {
      const supabase = createClient();

      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${interventoId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(FOTO_BUCKET)
          .upload(path, file, { contentType: file.type });

        if (uploadError) {
          toast.error(`Errore nel caricamento di "${file.name}": ${uploadError.message}`);
          return;
        }

        const result = await recordInterventoFoto(interventoId, path, file.name);

        if ("error" in result) {
          await supabase.storage.from(FOTO_BUCKET).remove([path]);
          toast.error(result.error);
          return;
        }
      }

      toast.success(files.length > 1 ? "Foto caricate." : "Foto caricata.");
      router.refresh();
    });
  }

  function handleDelete(fotoId: string) {
    if (!window.confirm("Eliminare questa foto? L'operazione non è reversibile.")) return;

    startDeleting(async () => {
      const result = await deleteInterventoFoto(fotoId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Foto eliminata.");
      setOpenIndex(null);
      router.refresh();
    });
  }

  function showPrev() {
    if (openIndex === null) return;
    setOpenIndex((openIndex - 1 + foto.length) % foto.length);
  }

  function showNext() {
    if (openIndex === null) return;
    setOpenIndex((openIndex + 1) % foto.length);
  }

  const current = openIndex !== null ? foto[openIndex] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Fotografie ({foto.length})</p>
        <Button type="button" size="sm" onClick={handleUploadClick} disabled={uploading}>
          <Upload className="size-4" />
          {uploading ? "Caricamento..." : "Carica Foto"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      {foto.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
          <ImageOff className="size-6" />
          Nessuna foto caricata.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {foto.map((f, index) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              className="aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt={f.nomeFile ?? "Foto intervento"} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={current !== null} onOpenChange={(next) => !next && setOpenIndex(null)}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-3 sm:max-w-3xl">
          <DialogTitle className="sr-only">{current?.nomeFile ?? "Foto intervento"}</DialogTitle>
          {current && (
            <>
              <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.url}
                  alt={current.nomeFile ?? "Foto intervento"}
                  className="max-h-[70vh] w-full object-contain"
                />
                {foto.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={showPrev}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={showNext}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm text-muted-foreground">{current.nomeFile}</p>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(current.id)}
                  disabled={deleting}
                >
                  {deleting ? "Eliminazione..." : "Elimina"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
