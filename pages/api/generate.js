import fs from "fs";
import path from "path";
import formidable from "formidable";
import * as XLSX from "xlsx";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import JSZip from "jszip";

// Next.js needs this off so formidable can read the raw multipart upload
export const config = {
  api: {
    bodyParser: false,
  },
};

// Formats a number the Indian way: 1,23,45,678
function indianFormat(num) {
  const n = Math.round(Number(num) || 0);
  const s = Math.abs(n).toString();
  let result;
  if (s.length <= 3) {
    result = s;
  } else {
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    const parts = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) parts.unshift(rest);
    result = parts.join(",") + "," + last3;
  }
  return n < 0 ? "-" + result : result;
}

function safeFilename(name) {
  return String(name)
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "_");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST with a file upload" });
  }

  try {
    const form = formidable({ multiples: false });
    const [, files] = await form.parse(req);

    const fileArr = files.file;
    const uploaded = Array.isArray(fileArr) ? fileArr[0] : fileArr;
    if (!uploaded) {
      return res.status(400).json({ error: "No file uploaded. Field name must be 'file'." });
    }

    // 1. Read the uploaded Excel file
    const workbook = XLSX.readFile(uploaded.filepath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Expect columns (case-insensitive match): "Name of the party", "Balance as per books"
    const findKey = (row, candidates) => {
      const keys = Object.keys(row);
      for (const c of candidates) {
        const found = keys.find((k) => k.toLowerCase().trim() === c.toLowerCase());
        if (found) return found;
      }
      return null;
    };

    if (rows.length === 0) {
      return res.status(400).json({ error: "The uploaded sheet has no data rows." });
    }

    const nameKey = findKey(rows[0], ["Name of the party", "Party Name", "Name"]);
    const balanceKey = findKey(rows[0], ["Balance as per books", "Balance", "Closing Balance"]);

    if (!nameKey || !balanceKey) {
      return res.status(400).json({
        error:
          "Could not find required columns. Expected a party name column (e.g. 'Name of the party') and a balance column (e.g. 'Balance as per books').",
      });
    }

    // 2. Load the docx template once
    const templatePath = path.join(process.cwd(), "templates", "template.docx");
    const templateBuffer = fs.readFileSync(templatePath);

    // 3. Generate a filled docx per row, add to zip
    const zip = new JSZip();
    let count = 0;

    for (const row of rows) {
      const partyName = String(row[nameKey] || "").trim();
      const balanceRaw = row[balanceKey];
      if (!partyName || balanceRaw === "" || balanceRaw === undefined) continue;

      const pizZip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(pizZip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render({
        party_name: partyName,
        balance: indianFormat(balanceRaw),
      });

      const outBuffer = doc.getZip().generate({ type: "nodebuffer" });
      const filename = `Balance_Confirmation-${safeFilename(partyName)}.docx`;
      zip.file(filename, outBuffer);
      count++;
    }

    if (count === 0) {
      return res.status(400).json({ error: "No valid rows found to generate documents from." });
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Balance_Confirmations_${new Date().toISOString().slice(0, 10)}.zip"`
    );
    return res.status(200).send(zipBuffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate documents: " + err.message });
  }
}
