import { useEffect, useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [templatesList, setTemplatesList] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientPan, setClientPan] = useState("");
  const [clientGstin, setClientGstin] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [auditPeriodStart, setAuditPeriodStart] = useState("");
  const [auditPeriodEnd, setAuditPeriodEnd] = useState("");
  const [confirmationDate, setConfirmationDate] = useState("");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((list) => {
        setTemplatesList(list);
        if (list.length > 0) setTemplateId(list[0].id);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please choose an Excel file first.");
      return;
    }
    if (!clientName || !confirmationDate) {
      setError("Client name and confirmation date are required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("templateId", templateId);
      formData.append("clientName", clientName);
      formData.append("clientPan", clientPan);
      formData.append("clientGstin", clientGstin);
      formData.append("clientAddress", clientAddress);
      formData.append("auditPeriodStart", auditPeriodStart);
      formData.append("auditPeriodEnd", auditPeriodEnd);
      formData.append("confirmationDate", confirmationDate);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Balance_Confirmations_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>KVA OPTIMUS</h1>
        <p style={styles.subtitle}>
          Fill in your client's details, choose a letter format, and upload
          your Excel file. You'll get back a zip with a Word balance
          confirmation for every party.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.sectionLabel}>Letter format</div>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            style={styles.input}
          >
            {templatesList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {templatesList.find((t) => t.id === templateId)?.description && (
            <div style={styles.hint}>
              {templatesList.find((t) => t.id === templateId).description}
            </div>
          )}

          <div style={styles.sectionLabel}>Client (auditee) details</div>
          <input
            placeholder="Client name *"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            style={styles.input}
          />
          <div style={styles.row}>
            <input
              placeholder="PAN / TAN"
              value={clientPan}
              onChange={(e) => setClientPan(e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
            <input
              placeholder="GSTIN"
              value={clientGstin}
              onChange={(e) => setClientGstin(e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
          </div>
          <textarea
            placeholder="Registered address"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            style={{ ...styles.input, minHeight: 60, resize: "vertical" }}
          />

          <div style={styles.sectionLabel}>Audit period</div>
          <div style={styles.row}>
            <label style={styles.dateLabel}>
              Start
              <input
                type="date"
                value={auditPeriodStart}
                onChange={(e) => setAuditPeriodStart(e.target.value)}
                style={styles.input}
              />
            </label>
            <label style={styles.dateLabel}>
              End
              <input
                type="date"
                value={auditPeriodEnd}
                onChange={(e) => setAuditPeriodEnd(e.target.value)}
                style={styles.input}
              />
            </label>
          </div>

          <div style={styles.sectionLabel}>Confirmation date (as at)</div>
          <input
            type="date"
            value={confirmationDate}
            onChange={(e) => setConfirmationDate(e.target.value)}
            style={styles.input}
          />

          <div style={styles.uploadHeader}>
            <div style={styles.sectionLabel}>Upload file</div>
            <a
              href="/Party_Balances_Template.xlsx"
              download
              style={styles.downloadLink}
            >
              Download Excel template
            </a>
          </div>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.fileInput}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Generating..." : "Generate Balance Confirmations"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.note}>
          <strong>Expected Excel columns:</strong> "Party Name" and "Balance
          as on date" (a few common variations of these names are also
          matched automatically). Use the "Download Excel template" link
          above if you'd like a ready-made file to fill in.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#faf8f3",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "32px 36px",
    maxWidth: 560,
    width: "100%",
    border: "1px solid #eae6db",
    boxShadow: "0 2px 12px rgba(20, 20, 15, 0.06)",
  },
  title: { fontSize: 28, marginBottom: 8, color: "#1c1f1d" },
  subtitle: { fontSize: 14, color: "#6f6b5e", lineHeight: 1.5, marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0b6b4c",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 14,
    marginBottom: 2,
  },
  uploadHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 14,
  },
  downloadLink: {
    fontSize: 12,
    color: "#0b6b4c",
    textDecoration: "underline",
    cursor: "pointer",
  },
  row: { display: "flex", gap: 10 },
  dateLabel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    fontSize: 12,
    color: "#6f6b5e",
    gap: 4,
  },
  input: {
    padding: 10,
    border: "1px solid #e2ddd0",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
    background: "#fdfcf9",
  },
  hint: { fontSize: 12, color: "#8a8676", marginTop: -2 },
  fileInput: {
    padding: 10,
    border: "1px solid #e2ddd0",
    borderRadius: 8,
    fontSize: 14,
    background: "#fdfcf9",
  },
  button: {
    marginTop: 10,
    padding: "12px 16px",
    background: "#0f9d6c",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: { color: "#b3261e", marginTop: 14, fontSize: 14 },
  note: {
    marginTop: 20,
    padding: 12,
    background: "#f3f1e8",
    borderRadius: 8,
    fontSize: 13,
    color: "#4a463c",
  },
};
