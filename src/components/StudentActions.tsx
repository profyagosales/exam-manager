"use client"

import { Trash } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import EditStudentDialog from "@/components/EditStudentDialog"
import { useRouter } from "next/navigation"

type Props = {
  id: string
  name: string
  call_number: number
  email: string
  phone: string | null
}

export default function StudentActions(student: Props) {
  const router = useRouter()
  return (
    <div className="flex gap-2">
      {/* botão editar */}
      <EditStudentDialog student={student} />

      {/* botão excluir */}
      <button
        onClick={async () => {
          if (!confirm(`Excluir ${student.name}?`)) return
          await supabase.from("students").delete().eq("id", student.id)
          router.refresh()
        }}
        title="Excluir"
        className="text-red-600 hover:text-red-800"
      >
        <Trash size={16} />
      </button>
    </div>
  )
}
