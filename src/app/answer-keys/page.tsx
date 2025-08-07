// src/app/answer-keys/page.tsx
import Link from "next/link";
import AddAnswerKeyDialog from "./AddAnswerKeyDialog";
import { createSupabaseServer } from "@/lib/supabaseServer";

export const revalidate = 0; // fetch fresh data every request

export default async function AnswerKeysPage() {
  // cria o supabase client no lado‑servidor
  const supabase = await createSupabaseServer();

  // busca todos os gabaritos, mais recentes primeiro
  const { data: answerKeys, error } = await supabase
    .from("answer_keys")
    .select("id, title, created_at, sheet_url, class_ids")
    .order("created_at", { ascending: false });

  // busca todos os nomes de turmas para traduzir UUID → nome
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name");

  const nameById = Object.fromEntries(
    (classes ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
  );

  if (error) {
    console.error(error.message);
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gabaritos</h1>
        <AddAnswerKeyDialog />
      </div>

      {answerKeys?.length ? (
        <ul className="space-y-2">
          {answerKeys.map((key) => (
            <li
              key={key.id}
              className="border rounded p-3 flex flex-col sm:flex-row sm:justify-between gap-2"
            >
              <div>
                <p className="font-medium">{key.title}</p>

                <p className="font-medium mb-1">{key.title}</p>

                {key.sheet_url && (
                  <a
                    href={key.sheet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline block"
                  >
                    Baixar gabarito em branco
                  </a>
                )}

                <p className="text-sm text-gray-500">
                  Turmas:&nbsp;
                  {Array.isArray(key.class_ids)
                    ? key.class_ids
                        .map((id: string) => nameById[id] ?? id)
                        .join(", ")
                    : "—"}{" "}
                  • {new Date(key.created_at).toLocaleDateString()}
                </p>
              </div>

              <Link
                href={`/correction/${key.id}`}
                className="text-blue-600 hover:underline self-start sm:self-center"
              >
                Corrigir
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum gabarito cadastrado.</p>
      )}
    </main>
  );
}
