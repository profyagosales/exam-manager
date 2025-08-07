import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AddClassDialog from "@/components/AddClassDialog";
import ClassActions from "@/components/ClassActions";

export default async function ClassesPage() {
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, year")
    .order("year", { ascending: false });

  return (
    <main className="container mx-auto p-6">
      <h1 className="mb-4 flex items-center justify-between text-2xl font-bold">
        <span>Turmas</span>
        <AddClassDialog />
      </h1>

      <table className="w-full table-auto border">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Ano letivo</th>
            <th className="p-2 text-left">Ações</th>
          </tr>
        </thead>

        <tbody>
          {classes?.map((c) => (
            <tr key={c.id} className="border-t hover:bg-muted/40">
              {/* ③  ENVOLVEMOS o nome com <Link> */}
              <td className="p-2 font-medium">
                <Link href={`/classes/${c.id}`} className="block w-full">
                  {c.name}
                </Link>
              </td>

              <td className="p-2">{c.year}</td>

              <td className="p-2">
                <ClassActions id={c.id} name={c.name} year={c.year} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
