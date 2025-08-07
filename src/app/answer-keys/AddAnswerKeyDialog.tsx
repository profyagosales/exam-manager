"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { buildHtml } from "@/lib/buildHtml";

export default function AddAnswerKeyDialog() {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  // Form state
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [headerTitle, setHeaderTitle] = useState("Prova");
  const [headerInstructions, setHeaderInstructions] = useState(
    "Preencha apenas uma alternativa por questão."
  );
  const [numQuestions, setNumQuestions] = useState(30);
  const [questionsPerRow, setQuestionsPerRow] = useState(10);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(1);
  const [schoolName, setSchoolName] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [professorName, setProfessorName] = useState("");
  const [logoLeft, setLogoLeft] = useState<File | null>(null);
  const [logoRight, setLogoRight] = useState<File | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  const [students, setStudents] = useState<{ id: string; name: string; call_number: number; photo_url: string | null; class_id: string }[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [classNames, setClassNames] = useState<string[]>([]);

  // Load classes when dialog opens
  useEffect(() => {
    if (!open) return;
    supabase.from("classes").select("id, name").then(({ data }) => {
      setClasses(data ?? []);
    });
  }, [open]);

  // Load students when selectedClasses changes
  useEffect(() => {
    if (!selectedClasses.length) {
      setStudents([]);
      return;
    }
    supabase
      .from("students")
      .select("id,name,call_number,photo_url,class_id")
      .in("class_id", selectedClasses)
      .then(({ data }) => setStudents(data ?? []));
  }, [selectedClasses]);

  // Live preview HTML
  const previewHtml = useMemo(() => {
    const previewLogoLeftUrl = logoLeft ? URL.createObjectURL(logoLeft) : null;
    const previewLogoRightUrl = logoRight ? URL.createObjectURL(logoRight) : null;
    return buildHtml({
      headerTitle,
      headerInstructions,
      numQuestions,
      questionsPerRow,
      classIds: selectedClasses,
      totalScore,
      schoolName,
      discipline,
      professorName,
      logoLeftUrl: previewLogoLeftUrl,
      logoRightUrl: previewLogoRightUrl,
      student: null,
    });
  }, [
    headerTitle,
    headerInstructions,
    numQuestions,
    questionsPerRow,
    selectedClasses,
    totalScore,
    schoolName,
    discipline,
    professorName,
    logoLeft,
    logoRight,
  ]);

  async function handleSave() {
    if (!selectedClasses.length) {
      alert("Escolha pelo menos uma turma!");
      return;
    }
    if (!headerTitle) {
      alert("Digite o nome da prova!");
      return;
    }
    // Save logos to storage if present
    let logoLeftUrl: string | null = null;
    let logoRightUrl: string | null = null;
    if (logoLeft) {
      const ext = logoLeft.name.split(".").pop();
      const fileName = `logos/${uuidv4()}_left.${ext}`;
      const { data: lData, error: lError } = await supabase.storage
        .from("assets")
        .upload(fileName, logoLeft, { upsert: true });
      if (!lError) {
        const { data: urlData } = supabase.storage.from("assets").getPublicUrl(fileName);
        logoLeftUrl = urlData.publicUrl;
      }
    }
    if (logoRight) {
      const ext = logoRight.name.split(".").pop();
      const fileName = `logos/${uuidv4()}_right.${ext}`;
      const { data: rData, error: rError } = await supabase.storage
        .from("assets")
        .upload(fileName, logoRight, { upsert: true });
      if (!rError) {
        const { data: urlData } = supabase.storage.from("assets").getPublicUrl(fileName);
        logoRightUrl = urlData.publicUrl;
      }
    }

    // Insert an answer_key for each selected student
    for (const studentId of selectedStudents.length > 0 ? selectedStudents : [null]) {
      // If no students selected, insert one general answer_key
      const { data, error } = await supabase
        .from("answer_keys")
        .insert({
          class_ids: selectedClasses,
          header_title: headerTitle,
          header_instructions: headerInstructions,
          questions_per_row: questionsPerRow,
          points_per_question: pointsPerQuestion,
          num_questions: numQuestions,
          school_name: schoolName,
          discipline,
          professor_name: professorName,
          logo_left_url: logoLeftUrl,
          logo_right_url: logoRightUrl,
          student_id: studentId,
        })
        .select()
        .single();
      if (error || !data) {
        alert(error?.message || "Erro ao salvar gabarito");
        return;
      }
      // Find student info if present
      let student = null;
      if (studentId) {
        student = students.find((s) => s.id === studentId);
      }
      // Generate PDF for this answer key
      const response = await fetch("/api/generateSheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerKeyId: data.id,
          schoolName,
          discipline,
          professorName,
          logoLeftUrl,
          logoRightUrl,
          totalScore,
          student: student
            ? {
                id: student.id,
                name: student.name,
                call_number: student.call_number,
                photo_url: student.photo_url,
                class_id: student.class_id,
              }
            : null,
        }),
      });
      if (!response.ok) {
        const msg = await response.text();
        alert("Erro ao gerar PDF: " + msg);
        return;
      }
    }
    setOpen(false);
    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Novo Gabarito</Button>

      <DialogContent className="max-h-[90vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <h2 className="text-lg font-semibold">Novo Gabarito</h2>
        </DialogHeader>

        <label className="block text-sm">
          Escola
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Disciplina
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Professor
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            value={professorName}
            onChange={(e) => setProfessorName(e.target.value)}
          />
        </label>
        <div className="flex gap-4">
          <label className="block text-sm">
            Logo Esquerda
            <input
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => setLogoLeft(e.target.files?.[0] || null)}
            />
          </label>
          <label className="block text-sm">
            Logo Direita
            <input
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => setLogoRight(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <label className="block text-sm">
          Nome da Prova
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            value={headerTitle}
            onChange={(e) => setHeaderTitle(e.target.value)}
          />
        </label>

        <label className="block text-sm">
          Instruções
          <textarea
            className="w-full border rounded p-2 mt-1 h-24"
            value={headerInstructions}
            onChange={(e) => setHeaderInstructions(e.target.value)}
            placeholder="Digite as instruções do cabeçalho aqui..."
          />
        </label>

        <label className="block text-sm">
          Turmas (CTRL+clique para múltiplas)
          <select
            multiple
            className="w-full border rounded p-2 mt-1 h-24"
            value={selectedClasses}
            onChange={(e) =>
              setSelectedClasses(Array.from(e.target.selectedOptions, (o) => o.value))
            }
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {students.length > 0 && (
          <label className="block text-sm">
            Alunos (CTRL+clique)
            <select
              multiple
              className="w-full border rounded p-2 mt-1 h-24"
              value={selectedStudents}
              onChange={(e) =>
                setSelectedStudents(Array.from(e.target.selectedOptions, (o) => o.value))
              }
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.call_number} – {s.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-sm">
          Nota Total
          <input
            type="number"
            min={0}
            step={0.1}
            className="w-full border rounded p-2 mt-1"
            value={totalScore}
            onChange={(e) => setTotalScore(Number(e.target.value))}
          />
        </label>

        <div className="flex gap-4">
          <label className="block text-sm">
            Nº Questões
            <input
              type="number"
              min={1}
              className="border rounded p-2 mt-1 w-20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            />
          </label>

          <label className="block text-sm">
            Questões por coluna
            <input
              type="number"
              min={1}
              className="border rounded p-2 mt-1 w-20"
              value={questionsPerRow}
              onChange={(e) => setQuestionsPerRow(Number(e.target.value))}
            />
          </label>

          <label className="block text-sm">
            Valor por questão
            <input
              type="number"
              min={0}
              step={0.1}
              className="border rounded p-2 mt-1 w-20"
              value={pointsPerQuestion}
              onChange={(e) => setPointsPerQuestion(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="border p-2 overflow-auto" style={{ height: 300 }}>
          <iframe
            title="preview"
            srcDoc={previewHtml}
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}