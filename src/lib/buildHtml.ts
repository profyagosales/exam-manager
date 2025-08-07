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
  classNames = [],
  logoLeftUrl,
  logoRightUrl,
  schoolName,
  discipline,
  professorName,
  date,
  student,
}: {
  headerTitle: string;
  headerInstructions: string;
  numQuestions: number;
  questionsPerRow: number;
  classNames?: string[];
  logoLeftUrl?: string;
  logoRightUrl?: string;
  schoolName?: string;
  discipline?: string;
  professorName?: string;
  date?: string;
  student?: {
    id: string;
    name: string;
    photoUrl: string;
    className: string;
    callNumber: number;
  };
}) {
  const studentClass = student?.className;
  const callNum = student?.callNumber ?? null;
  const callTens = callNum !== null ? Math.floor(callNum / 10) : null;
  const callUnits = callNum !== null ? callNum % 10 : null;
  // Build Turma rows
  const classOptionsHtml = (classNames || [])
    .map(name => `
      <div class="row">
        <span class="bubble"${name === studentClass ? ' style="background-color:black"' : ""}></span>
        <span class="label">${name}</span>
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
    .label { /* margin-left: 4mm; */ }
    .header-container { display: flex; align-items: center; justify-content: space-between; }
    .logo { max-height: 20mm; }
    .header-info { text-align: center; flex: 1; }
    .header-info .school,
    .header-info .discipline,
    .header-info .professor,
    .header-info .date { margin: 0; font-size: 10px; }
    .class-call-container { display: flex; justify-content: space-between; gap: 10mm; }
    .turmas-section, .call-section { flex: 1; }
  </style>
</head>
<body>
  <div class="box header-container">
    <img src="${logoLeftUrl || ''}" class="logo" alt="Left Logo"/>
    <div class="header-info">
      <div class="school">${schoolName || ''}</div>
      <div class="discipline">${discipline || ''}</div>
      <div class="professor">${professorName || ''}</div>
      <div class="date">${date || ''}</div>
      <h1>${headerTitle}</h1>
    </div>
    <img src="${logoRightUrl || ''}" class="logo" alt="Right Logo"/>
  </div>
  <div class="box student-info">
    <img src="${student?.photoUrl || ''}" class="student-photo" alt="Foto do aluno"/>
    <div><strong>Aluno:</strong> ${student?.name || '________________'}</div>
    <div><strong>Turma:</strong> ${student?.className || '____'}</div>
    <div><strong>Chamada:</strong> ${student?.callNumber ?? '____'}</div>
  </div>
  <div class="box">
    <strong>NOTA:</strong> _____________________________________________
  </div>
  <div class="box">${headerInstructions.replace(/\n/g, "<br/>")}</div>

  <div class="box class-call-container">
    <div class="turmas-section">
      <strong>Turmas:</strong>
      <div class="turmas">${classOptionsHtml}</div>
    </div>
    <div class="call-section">
      <strong>Número da chamada:</strong>
      <div class="id-grid">
        ${Array.from({length:10}, (_, d) => `
          <div class="row">
            <span class="q">${d}</span>
            <span class="bubble"${d === callTens ? ' style="background-color:black"' : ""}></span>
            <span class="bubble"${d === callUnits ? ' style="background-color:black"' : ""}></span>
          </div>`).join("")}
      </div>
    </div>
  </div>

  <div class="box"><h2>GABARITO</h2></div>

  <div class="container">
    ${colsHtml}
  </div>
</body>
</html>`;
}