// src/lib/buildHtml.ts
/**
 * Gera o HTML do cartão‑resposta.
 * Pode ser renderizado em PDF via htmlToPdf().
 */
export function buildHtml({
  headerTitle,
  headerInstructions,
  numQuestions,
  questionsPerRow,
  pointsPerQuestion = 1,
  classIds = [],
}: {
  headerTitle: string;
  headerInstructions: string;
  numQuestions: number;
  questionsPerRow: number;
  pointsPerQuestion?: number;
  classIds?: string[];
}) {
  // Build Turma rows
  const classOptionsHtml = classIds
    .map((id, idx) => `
      <div class="row">
        <span class="q">${idx + 1}</span>
        <span class="bubble"></span>
        <span class="label">${id}</span>
      </div>`)
    .join("");

  // Calcula colunas automáticas
  const rowsPerColumn = questionsPerRow;                // linhas por coluna
  const totalColumns = Math.ceil(numQuestions / rowsPerColumn);

  // Constrói as linhas de bolhas
  let colsHtml = "";
  for (let col = 0; col < totalColumns; col++) {
    colsHtml += `<div class="col">`;
    for (let row = 0; row < rowsPerColumn; row++) {
      const q = col * rowsPerColumn + row;
      if (q >= numQuestions) break;

      colsHtml += `
        <div class="row">
          <span class="q">${q + 1}</span>
          ${["A", "B", "C", "D", "E"]
            .map(() => `<span class="bubble"></span>`)
            .join("")}
        </div>`;
    }
    colsHtml += `</div>`;
  }

  return /*html*/ `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: sans-serif; font-size: 10px; }
    h1   { font-size: 18px; margin: 0 0 4mm; }
    .box {
      border: 1px solid #000;
      padding: 2mm;
      margin-bottom: 2mm;
    }
    .container {
      display: flex;
      gap: 20mm;
      flex-wrap: wrap;
      max-width: 175mm;
    }
    .col  { display: flex; flex-direction: column; gap: 2mm; }
    .row  { display: flex; align-items: center; gap: 2mm; }
    .q    { width: 14px; text-align: right; margin-right: 2mm; }
    .bubble {
      display: inline-block;
      width: 8px;
      height: 8px;
      border: 1px solid #000;
      border-radius: 50%;
    }
    .label { margin-left: 4mm; }
  </style>
</head>
<body>
  <div class="box"><h1>${headerTitle}</h1></div>
  <div class="box">Nome do Aluno: _______________________________________________</div>
  <div class="box">${headerInstructions.replace(/\n/g, "<br/>")}</div>
  <div class="box"><strong>Pontuação por questão:</strong> ${pointsPerQuestion}</div>

  <div class="box">
    <strong>Turmas:</strong>
    <div class="turmas">${classOptionsHtml}</div>
    <br/>
    <strong>Número da chamada:</strong>
    <div class="id-grid">
      ${Array.from({length:10}, (_, d) => `
        <div class="row">
          <span class="q">${d}</span><span class="bubble"></span>
          <span class="bubble"></span>
        </div>`).join("")}
    </div>
  </div>

  <div class="box"><h2>GABARITO</h2></div>

  <div class="container">
    ${colsHtml}
  </div>
</body>
</html>`;
}
