import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Please choose an Excel file first.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

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
          Upload your Trade Payables Excel file. It should have columns for the
          party name and the balance amount. You'll get back a zip file with a
          Word balance confirmation for every party.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
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
          <strong>Expected columns:</strong> "Name of the party" and "Balance as
          per books" (or similar names — the tool matches common variations).
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
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  title: { fontSize: 22, marginBottom: 8, color: "#1a1a2e" },
  subtitle: { fontSize: 14, color: "#555", lineHeight: 1.5, marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  fileInput: {
    padding: 10,
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 14,
  },
  button: {
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
