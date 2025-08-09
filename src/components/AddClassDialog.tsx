"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function AddClassDialog() {
  const router = useRouter();                               // 🚀 para refresh rápido
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    year: new Date().getFullYear(),
  });

  /* ---------------------- handlers ---------------------- */
  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setSaving(true);

    const { error } = await supabase.from("classes").insert({
      name: form.name.trim(),
      year: Number(form.year),
    });

    if (error) {
      console.error("Supabase error:", error);
      alert("Erro ao salvar: " + error.message);
    } else {
      setOpen(false);                     // fecha modal
      setForm({ name: "", year: new Date().getFullYear() });
      router.refresh();                   // recarrega /classes sem F5
    }

    setSaving(false);
  };
  /* ------------------------------------------------------ */

  return (
    <>
      {/* Botão que abre o diálogo */}
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} className="mr-2" />
        Nova turma
      </Button>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova turma</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label>Nome (ex.: 2º A)</Label>
              <Input
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="2º A"
              />
            </div>

            <div>
              <Label>Ano letivo</Label>
              <Input
                name="year"
                type="number"
                value={form.year}
                onChange={handle}
              />
            </div>
          </div>

          <Button className="w-full" disabled={saving} onClick={save}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
