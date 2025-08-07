"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"

type Props = { cls: { id: string; name: string; year: number } }

export default function EditClassDialog({ cls }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: cls.name, year: cls.year })

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const save = async () => {
    setSaving(true)
    const { error } = await supabase
      .from("classes")
      .update({ name: form.name, year: Number(form.year) })
      .eq("id", cls.id)

    if (!error) {
      setOpen(false)
      location.reload()
    }
    setSaving(false)
  }

  return (
    <>
      <button
        title="Editar turma"
        className="text-blue-600 hover:text-blue-800"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Edit size={16}/>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar turma</DialogTitle></DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label>Nome</Label>
              <Input name="name" value={form.name} onChange={handle}/>
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

          <Button disabled={saving} onClick={save}>
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
