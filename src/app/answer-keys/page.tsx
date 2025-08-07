"use client";

import { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { buildHtml } from "@/lib/buildHtml";

export default function AnswerKeysPage() {
  const supabase = useSupabaseClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [questionsPerColumn, setQuestionsPerColumn] = useState(5);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(1);
  const [school, setSchool] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [professor, setProfessor] = useState("");
  const [logoSchool, setLogoSchool] = useState<string | null>(null);
  const [logoGov, setLogoGov] = useState<string | null>(null);
  const [answerKeys, setAnswerKeys] = useState<any[]>([]);

  async function fetchAnswerKeys() {
    const { data, error } = await supabase
      .from("answer_keys")
      .select("id, title, header_title, header_instru, header_professor");
    if (!error && data) setAnswerKeys(data);
  }

  useEffect(() => {
    fetchAnswerKeys();
  }, []);

  async function handleSubmit() {
    await supabase.from("answer_keys").insert({
      title: name,
      instructions,
      class_ids: selectedClasses,
      questions_per_column: questionsPerColumn,
      points_per_question: pointsPerQuestion,
      header_title: school,
      header_instru: discipline,
      header_professor: professor,
    });
    setOpen(false);
    fetchAnswerKeys();
  }

  return (
    <main className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gabaritos</h1>
        <button
          onClick={() => setOpen(true)}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          + Novo gabarito
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {answerKeys.map((key) => (
          <div key={key.id} className="rounded border p-4 shadow hover:shadow-md bg-white">
            <h2 className="text-lg font-semibold">{key.title}</h2>
            <p className="text-sm text-gray-600">Escola: {key.header_title}</p>
            <p className="text-sm text-gray-600">Disciplina: {key.header_instru}</p>
            <p className="text-sm text-gray-600 mb-2">Professor: {key.header_professor}</p>
            <div className="flex gap-4 text-sm">
              <button className="text-blue-600 hover:underline">✏️ Editar</button>
              <button className="text-red-600 hover:underline">🗑️ Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-4xl rounded bg-white p-6 shadow-lg">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-center">Novo Gabarito</h2>

              <label className="flex flex-col gap-1">
                Nome da Prova
                <input className="input" value={name} onChange={e => setName(e.target.value)} required />
              </label>

              <label className="flex flex-col gap-1">
                Instruções
                <textarea className="input" value={instructions} onChange={e => setInstructions(e.target.value)} />
              </label>

              <label className="flex flex-col gap-1">
                Escola
                <input className="input" value={school} onChange={e => setSchool(e.target.value)} />
              </label>

              <label className="flex flex-col gap-1">
                Disciplina
                <input className="input" value={discipline} onChange={e => setDiscipline(e.target.value)} />
              </label>

              <label className="flex flex-col gap-1">
                Professor
                <input className="input" value={professor} onChange={e => setProfessor(e.target.value)} />
              </label>

              <div className="flex gap-4">
                <label className="flex flex-col gap-1 w-1/3">
                  Nº Questões
                  <input type="number" min={1} className="input" value={30} readOnly />
                </label>
                <label className="flex flex-col gap-1 w-1/3">
                  Questões por coluna
                  <input type="number" min={1} className="input" value={questionsPerColumn} onChange={e => setQuestionsPerColumn(Number(e.target.value))} />
                </label>
                <label className="flex flex-col gap-1 w-1/3">
                  Valor por questão
                  <input type="number" min={1} className="input" value={pointsPerQuestion} onChange={e => setPointsPerQuestion(Number(e.target.value))} />
                </label>
              </div>

              <div
                className="border p-4 bg-white overflow-auto text-xs max-h-[500px]"
                dangerouslySetInnerHTML={{
                  __html: buildHtml({
                    headerTitle: name,
                    headerInstructions: instructions,
                    numQuestions: 30,
                    questionsPerRow: questionsPerColumn,
                    pointsPerQuestion,
                    classNames: selectedClasses,
                    logoLeftUrl: logoSchool ?? "",
                    logoRightUrl: logoGov ?? "",
                    schoolName: school,
                    discipline: discipline,
                    professorName: professor,
                    date: "",
                  }),
                }}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded bg-gray-200 px-4 py-2">Cancelar</button>
                <button type="submit" className="rounded bg-black px-4 py-2 text-white">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}