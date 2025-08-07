import puppeteer from "puppeteer";

export async function htmlToPdf(html: string): Promise<Buffer> {
  // Chrome em background
  const browser = await puppeteer.launch({
    headless: "new",         // mais leve
    args: ["--no-sandbox"],  // linux container
  });
  const page = await browser.newPage();

  // põe o HTML direto
  await page.setContent(html, { waitUntil: "networkidle0" });

  // A4 portrait
  const pdf = await page.pdf({
    format: "A4",
    margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    printBackground: true,
  });

  await browser.close();
  return pdf;
}