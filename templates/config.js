// Add more templates here as you create them.
// `file` must match a .docx file inside the /templates folder, containing
// the same {party_name} and {balance} tags, plus any of the batch-level tags
// used in the form (client_name, client_pan, client_gstin, client_address,
// audit_period_start, audit_period_end, confirmation_date).
module.exports = [
  {
    id: "payables_standard",
    label: "Trade Payables (with MSME Disclosure)",
    file: "template_standard.docx",
    description:
      "Full SA 505 trade payables confirmation letter including the MSMED Act disclosure section.",
  },
  {
    id: "payables_simple",
    label: "Trade Payables (no MSME Disclosure)",
    file: "template_simple.docx",
    description:
      "Trade payables confirmation letter without the MSME disclosure section.",
  },
  {
    id: "receivables",
    label: "Trade Receivables",
    file: "template_receivables.docx",
    description:
      "SA 505 trade receivables (debtor) confirmation letter.",
  },
];
