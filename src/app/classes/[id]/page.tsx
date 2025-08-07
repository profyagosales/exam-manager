import Link from "next/link";                 // 👈 NOVO
import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";

import AddStudentDialog from "@/components/AddStudentDialog";
import StudentActions from "@/components/StudentActions";

export default async function StudentsPage({
  params,
}: {
  params: { id: string };
}) {
  /* ---------- busca da turma ---------- */
  const { data: turma } = await supabase
    .from("classes")
    .select("name, year")
    .eq("id", params.id)
    .single();

  if (!turma) return notFound();

  /* ---------- busca dos alunos ---------- */
  const { data: students } = await supabase
    .from("students")
    .select("id, call_number, name, email, photo_url, phone")
    .eq("class_id", params.id)
    .order("call_number");

  /* ---------- JSX ---------- */
  return (
    <main className="container mx-auto p-6">
      {/* ← LINK DE VOLTA */}
      <Link
        href="/classes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
      >
        ← Turmas
      </Link>

      <h1 className="mb-4 flex items-center justify-between text-2xl font-bold">
        <span>
          {turma.name} — {turma.year}
        </span>

        {/* botão que abre o modal */}
        <AddStudentDialog classId={params.id} />
      </h1>

      <table className="w-full table-auto border">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Foto</th>
            <th className="p-2 text-left">Nº</th>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">E-mail</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>

        <tbody>
          {students?.map((s) => (
            <tr key={s.id} className="border-t">
              {/* Foto */}
              <td className="p-2">
                <img
                  src={s.photo_url ?? "/avatar-placeholder.png"}
                  alt={s.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              </td>

              {/* Nº, nome, e-mail */}
              <td className="p-2 text-center">{s.call_number}</td>
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.email}</td>

              {/* Ações (editar / excluir) */}
              <td className="p-2">
                <StudentActions
                  id={s.id}
                  name={s.name}
                  call_number={s.call_number}
                  email={s.email}
                  phone={s.phone}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
