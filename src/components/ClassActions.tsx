"use client"

import { Edit, Trash } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import EditClassDialog from "@/components/EditClassDialog"

type Props = { id: string; name: string; year: number }

export default function ClassActions(cls: Props) {
  return (
    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
      <EditClassDialog cls={cls} />

      <button
        title="Excluir turma"
        className="text-red-600 hover:text-red-800"
        onClick={async () => {
          if (!confirm(`Excluir a turma ${cls.name}?`)) return
          await supabase.from("classes").delete().eq("id", cls.id)
          location.reload()
        }}
      >
        <Trash size={16}/>
      </button>
    </div>
  )
}
