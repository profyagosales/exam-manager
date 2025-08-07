import { NextRequest, NextResponse } from "next/server";
import { htmlToPdf } from "@/lib/htmlToPdf";
import { buildHtml } from "@/lib/buildHtml";
import { createClient } from "@supabase/supabase-js";

// Supabase client (Service‑Role) — ignora RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/generateSheet
 * Body: {
 *   answerKeyId: string,
 *   numQuestions: number,
 *   questionsPerRow: number,
 *   headerTitle: string,
 *   headerInstructions: string,
 *   pointsPerQuestion: number,
 *   classIds: string[]
 * }
 */
export async function POST(req: NextRequest) {
  const {
    answerKeyId,
    numQuestions,
    questionsPerRow = 10,
    headerTitle = "Prova",
    headerInstructions = "Preencha apenas uma alternativa por questão.",
    pointsPerQuestion = 1,
    classIds = [],
  } = await req.json();

  /* ========== 1. Gerar HTML e converter em PDF ========== */
  const html = buildHtml({
    headerTitle,
    headerInstructions,
    numQuestions,
    questionsPerRow,
    pointsPerQuestion,
    classIds,
  });

  const pdfBytes = await htmlToPdf(html);
  const filename = `sheet-${answerKeyId}.pdf`;

  /* ========== 3. Upload no Storage ========== */
  const { error: uploadError } = await supabase.storage
    .from("answer-sheets")
    .upload(filename, Buffer.from(pdfBytes), {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("answer-sheets").getPublicUrl(filename);

  /* ========== 4. Atualiza tabela answer_keys ========== */
  const { data: upd, error: updErr } = await supabase
    .from("answer_keys")
    .update({
      sheet_url: publicUrl,
      bubble_map: null,
      header_title: headerTitle,
      header_instructions: headerInstructions,
      questions_per_row: questionsPerRow,
      points_per_question: pointsPerQuestion,
      total_points: pointsPerQuestion * numQuestions,
      class_ids: classIds,
    })
    .eq("id", answerKeyId)
    .select();

  if (updErr) {
    console.error("UPDATE error →", updErr.message);
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: publicUrl });
}
