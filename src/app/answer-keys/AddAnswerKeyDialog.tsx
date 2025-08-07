"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  /* ───────────────── Load classes when dialog opens ──────────────── */
  useEffect(() => {
    if (!open) return;
    supabase
      .from("classes")
      .select("id, name")
      .then(({ data }) => setClasses(data ?? []));
  }, [open]);

  /* ───────────────── Live preview HTML ───────────────────────────── */
  const previewHtml = useMemo(() => {
    return buildHtml({
      headerTitle,
      headerInstructions,
      numQuestions,
      questionsPerRow,
      classIds: selectedClasses,
    });
  }, [headerTitle, headerInstructions, numQuestions, questionsPerRow, selectedClasses]);

  /* ───────────────── Save handler ───────────────────────────────── */
  async function handleSave() {
    if (!selectedClasses.length) {
      alert("Escolha pelo menos uma turma!");
      return;
    }
    if (!headerTitle) {
      alert("Digite o nome da prova!");
      return;
    }

    const { data, error } = await supabase
      .from("answer_keys")
      .insert({
        class_ids: selectedClasses,
        header_title: headerTitle,
        header_instructions: headerInstructions,
        questions_per_row: questionsPerRow,
        points_per_question: pointsPerQuestion,
        num_questions: numQuestions,
      })
      .select()
      .single();

    if (error || !data) {
      alert(error?.message || "Erro ao salvar gabarito");
      return;
    }

    const response = await fetch("/api/generateSheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerKeyId: data.id }),
    });

    if (!response.ok) {
      const msg = await response.text();
      alert("Erro ao gerar PDF: " + msg);
      return;
    }

    setOpen(false);
    window.location.reload();
  }

  /* ────────────────────────── JSX ──────────────────────────────── */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>Novo Gabarito</Button>

      <DialogContent className="max-h-[90vh] overflow-y-auto space-y-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Novo Gabarito
          </DialogTitle>
        </DialogHeader>

        {/* Nome da prova */}
        <label className="block text-sm">
          Nome da Prova
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            value={headerTitle}
            onChange={(e) => setHeaderTitle(e.target.value)}
          />
        </label>

        {/* Instruções */}
        <label className="block text-sm">
          Instruções
          <textarea
            rows={4}
            className="w-full border rounded p-2 mt-1"
            value={headerInstructions}
            onChange={(e) => setHeaderInstructions(e.target.value)}
          />
        </label>

        {/* Turmas */}
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

        {/* Parâmetros numéricos */}
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

        {/* Preview */}
        <div className="border p-2 overflow-auto" style={{ height: 300 }}>
          <iframe
            title="preview"
            srcDoc={previewHtml}
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        </div>

        {/* Ações */}
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