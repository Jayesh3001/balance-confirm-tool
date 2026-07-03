// Add more templates here as you create them.
// `file` must match a .docx file inside the /templates folder, containing
// the same {party_name} and {balance} tags, plus any of the batch-level tags
// used in fields.js (client_name, client_pan, etc).
module.exports = [
  {
    id: "standard",
    label: "Standard (with MSME disclosure)",
    file: "template_standard.docx",
    description:
      "Full SA 505 confirmation letter including the MSMED Act disclosure section.",
  },
  {
    id: "simple",
    label: "Simple (no MSME disclosure)",
    file: "template_simple.docx",
    description:
      "Shorter version for parties where MSME disclosure isn't required.",
  },
];
