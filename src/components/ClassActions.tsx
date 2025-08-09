"use client"

import { Trash } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import EditClassDialog from "@/components/EditClassDialog"
import { useRouter } from "next/navigation"

type Props = { id: string; name: string; year: number }

export default function ClassActions(cls: Props) {
  const router = useRouter()
  return (
    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
      <EditClassDialog cls={cls} />

      <button
        title="Excluir turma"
        className="text-red-600 hover:text-red-800"
        onClick={async () => {
          if (!confirm(`Excluir a turma ${cls.name}?`)) return
          await supabase.from("classes").delete().eq("id", cls.id)
          router.refresh()
        }}
      >
        <Trash size={16}/>
      </button>
    </div>
  )
}
