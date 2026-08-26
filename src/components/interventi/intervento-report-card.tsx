"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { generateInterventoReport } from "@/app/(dashboard)/interventi/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateIT } from "@/lib/format";

export function InterventoReportCard({
  interventoId,
  initialOggetto,
  initialVerifiche,
  initialOperatore,
  reportUrl,
  reportGeneratoAt,
}: {
  interventoId: string;
  initialOggetto: string;
  initialVerifiche: string;
  initialOperatore: string;
  reportUrl: string | null;
  reportGeneratoAt: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [oggetto, setOggetto] = useState(initialOggetto);
  const [verifiche, setVerifiche] = useState(initialVerifiche);
  const [operatore, setOperatore] = useState(initialOperatore);

  function handleOpen() {
    setOggetto(initialOggetto);
    setVerifiche(initialVerifiche);
    setOperatore(initialOperatore);
    setOpen(true);
  }

  function handleSubmit() {
    if (!oggetto.trim() || !verifiche.trim() || !operatore.trim()) {
      toast.error("Compila oggetto, verifiche eseguite e nome operatore.");
      return;
    }

    startTransition(async () => {
      const result = await generateInterventoReport(interventoId, { oggetto, verifiche, operatore });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Report generato.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {reportGeneratoAt ? `Generato il ${formatDateIT(reportGeneratoAt)}` : "Nessun report generato."}
        </p>
        <Button type="button" size="sm" onClick={handleOpen}>
          <FileText className="size-4" />
          {reportUrl ? "Rigenera Report" : "Genera Report"}
        </Button>
      </div>

      {reportUrl && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          nativeButton={false}
          render={<a href={reportUrl} target="_blank" rel="noopener noreferrer" />}
        >
          Scarica PDF
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Genera report intervento</DialogTitle>
            <DialogDescription>
              Compila i dati dell&apos;intervento svolto: verranno uniti ai dati aziendali per creare il
              PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="report-oggetto">Oggetto</Label>
              <Input
                id="report-oggetto"
                value={oggetto}
                onChange={(e) => setOggetto(e.target.value)}
                placeholder="Es. Ricerca perdita impianto idrico"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="report-verifiche">Verifiche eseguite</Label>
              <Textarea
                id="report-verifiche"
                value={verifiche}
                onChange={(e) => setVerifiche(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="report-operatore">Nome operatore</Label>
              <Input
                id="report-operatore"
                value={operatore}
                onChange={(e) => setOperatore(e.target.value)}
                placeholder="Es. Marco Fagherazzi"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={handleSubmit} disabled={pending}>
              {pending ? "Generazione..." : "Genera Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
