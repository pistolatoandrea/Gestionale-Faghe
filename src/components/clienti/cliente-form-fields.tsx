"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClienteDraft } from "@/lib/cliente-draft";
import type { ClienteTipo } from "@/lib/supabase/types";

export function ClienteFormFields({
  value,
  onChange,
}: {
  value: ClienteDraft;
  onChange: (updater: (c: ClienteDraft) => ClienteDraft) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Tipo</Label>
          <Select
            modal={false}
            value={value.tipo}
            onValueChange={(v) => onChange((c) => ({ ...c, tipo: v as ClienteTipo }))}
          >
            <SelectTrigger className="w-full" onClick={(e) => e.stopPropagation()}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent onClick={(e) => e.stopPropagation()}>
              <SelectItem value="privato">Privato</SelectItem>
              <SelectItem value="azienda">Azienda</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Nome</Label>
          <Input
            value={value.nome}
            onChange={(e) => onChange((c) => ({ ...c, nome: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Telefono</Label>
          <Input
            value={value.telefono}
            onChange={(e) => onChange((c) => ({ ...c, telefono: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={value.email}
            onChange={(e) => onChange((c) => ({ ...c, email: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Indirizzo</Label>
        <Input
          value={value.indirizzo}
          onChange={(e) => onChange((c) => ({ ...c, indirizzo: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Città</Label>
          <Input
            value={value.citta}
            onChange={(e) => onChange((c) => ({ ...c, citta: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>CAP</Label>
          <Input
            value={value.cap}
            onChange={(e) => onChange((c) => ({ ...c, cap: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label>P.IVA / Codice Fiscale</Label>
        <Input
          value={value.piva_cf}
          onChange={(e) => onChange((c) => ({ ...c, piva_cf: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Note</Label>
        <Textarea
          value={value.note}
          onChange={(e) => onChange((c) => ({ ...c, note: e.target.value }))}
          rows={2}
        />
      </div>
    </div>
  );
}
