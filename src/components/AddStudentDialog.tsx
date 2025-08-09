"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { nanoid } from "nanoid"

type Props = {
  classId: string
}

export default function AddStudentDialog({ classId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    call_number: "",
    name: "",
    email: "",
    phone: "",
    photo: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    if (name === "photo" && files) {
      setForm({ ...form, photo: files[0] })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const save = async () => {
    setError("")
    if (!form.name || !form.call_number) {
      setError("Nome e nº da chamada são obrigatórios.")
      return
    }
    setSaving(true)

    // 1. upload da foto (se houver)
    let photo_url: string | null = null
    if (form.photo) {
      const ext = form.photo.name.split(".").pop()
      const fileName = `${nanoid()}.${ext}`
      const { error: upErr } = await supabase
        .storage
        .from("student-photos")
        .upload(fileName, form.photo, { cacheControl: "3600" })

      if (upErr) {
        setError("Falha no upload da foto.")
        setSaving(false)
        return
      }
      photo_url = supabase.storage.from("student-photos").getPublicUrl(fileName).data.publicUrl
    }

    // 2. inserir no banco
    const { error: dbErr } = await supabase.from("students").insert({
      class_id: classId,
      call_number: Number(form.call_number),
      name: form.name,
      email: form.email,
      phone: form.phone,
      photo_url,
    })

    if (dbErr) setError(dbErr.message)
    else {
      setOpen(false)
      router.refresh()        // mostra o novo aluno
    }
    setSaving(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Adicionar aluno</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo aluno</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label>Nº da chamada</Label>
              <Input
                name="call_number"
                type="number"
                value={form.call_number}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Nome</Label>
              <Input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <Label>Foto</Label>
              <Input name="photo" type="file" accept="image/*" onChange={handleChange} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <Button disabled={saving} onClick={save}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
