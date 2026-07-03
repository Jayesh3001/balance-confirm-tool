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
        <h1 style={styles.title}>Balance Confirmation Generator</h1>
        <p style={styles.subtitle}>
          Fill in your client's details, choose a letter format, and upload
          your Trade Payables Excel file. You'll get back a zip with a Word
          balance confirmation for every party.
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

          <div style={styles.sectionLabel}>Trade payables file</div>
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
          <strong>Expected Excel columns:</strong> "Name of the party" and
          "Balance as per books" (or similar names — common variations are
          matched automatically).
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
    background: "#f4f5f7",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "32px 36px",
    maxWidth: 560,
    width: "100%",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  title: { fontSize: 22, marginBottom: 8, color: "#1a1a2e" },
  subtitle: { fontSize: 14, color: "#555", lineHeight: 1.5, marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#2d5be3",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 14,
    marginBottom: 2,
  },
  row: { display: "flex", gap: 10 },
  dateLabel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    fontSize: 12,
    color: "#555",
    gap: 4,
  },
  input: {
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  hint: { fontSize: 12, color: "#777", marginTop: -2 },
  fileInput: {
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
  },
  button: {
    marginTop: 10,
    padding: "12px 16px",
    background: "#2d5be3",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: { color: "#c0392b", marginTop: 14, fontSize: 14 },
  note: {
    marginTop: 20,
    padding: 12,
    background: "#f0f4ff",
    borderRadius: 8,
    fontSize: 13,
    color: "#333",
  },
};
