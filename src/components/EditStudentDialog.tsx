"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"

type Student = {
  id: string
  call_number: number
  name: string
  email: string
  phone: string | null
}

export default function EditStudentDialog({ student }: { student: Student }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Student>(student)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const save = async () => {
    setSaving(true)

    const { error } = await supabase
      .from("students")
      .update({
        call_number: Number(form.call_number),
        name: form.name,
        email: form.email,
        phone: form.phone,
      })
      .eq("id", form.id)

    if (!error) {
      setOpen(false)
      location.reload()
    } else {
      alert("Erro ao salvar: " + error.message)
    }
    setSaving(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Editar"
        className="text-blue-600 hover:text-blue-800"
      >
        <Edit size={16}/>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar aluno</DialogTitle></DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label>Nº da chamada</Label>
              <Input
                name="call_number"
                type="number"
                value={form.call_number}
                onChange={handle}
              />
            </div>
            <div>
              <Label>Nome</Label>
              <Input name="name" value={form.name} onChange={handle}/>
            </div>
            <div>
              <Label>E-mail</Label>
              <Input name="email" type="email" value={form.email} onChange={handle}/>
            </div>
            <div>
              <Label>Telefone</Label>
              <Input name="phone" value={form.phone ?? ""} onChange={handle}/>
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
