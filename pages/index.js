import { useEffect, useState } from "react";
import Head from "next/head";

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

  const selectedTemplate = templatesList.find((t) => t.id === templateId);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <title>KVA OPTIMUS</title>
      </Head>

      <div className="page">
        <div className="blob blob-a" aria-hidden="true" />
        <div className="blob blob-b" aria-hidden="true" />

        <main className="wrap">
          <header className="mark">
            <span className="mark-ink">KVA</span>
            <span className="mark-grad">OPTIMUS</span>
          </header>
          <p className="eyebrow">balance confirmation engine</p>

          <div className="card">
            <p className="lede">
              Pick a letter format, fill in the client &amp; audit details, drop
              in your Excel file — get back a zip of ready-to-send Word
              confirmations.
            </p>

            <form onSubmit={handleSubmit} className="form">
              <fieldset className="group">
                <legend className="badge">
                  <span className="badge-num">01</span> Letter format
                </legend>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="input"
                >
                  {templatesList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {selectedTemplate?.description && (
                  <p className="hint">{selectedTemplate.description}</p>
                )}
              </fieldset>

              <fieldset className="group">
                <legend className="badge">
                  <span className="badge-num">02</span> Client details
                </legend>
                <input
                  placeholder="Client name *"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="input"
                />
                <div className="row">
                  <input
                    placeholder="PAN / TAN"
                    value={clientPan}
                    onChange={(e) => setClientPan(e.target.value)}
                    className="input"
                  />
                  <input
                    placeholder="GSTIN"
                    value={clientGstin}
                    onChange={(e) => setClientGstin(e.target.value)}
                    className="input"
                  />
                </div>
                <textarea
                  placeholder="Registered address"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="input textarea"
                />
              </fieldset>

              <fieldset className="group">
                <legend className="badge">
                  <span className="badge-num">03</span> Audit period &amp; date
                </legend>
                <div className="row">
                  <label className="dateLabel">
                    Period start
                    <input
                      type="date"
                      value={auditPeriodStart}
                      onChange={(e) => setAuditPeriodStart(e.target.value)}
                      className="input"
                    />
                  </label>
                  <label className="dateLabel">
                    Period end
                    <input
                      type="date"
                      value={auditPeriodEnd}
                      onChange={(e) => setAuditPeriodEnd(e.target.value)}
                      className="input"
                    />
                  </label>
                </div>
                <label className="dateLabel">
                  Confirmation date (as at) *
                  <input
                    type="date"
                    value={confirmationDate}
                    onChange={(e) => setConfirmationDate(e.target.value)}
                    className="input"
                  />
                </label>
              </fieldset>

              <fieldset className="group">
                <legend className="badge">
                  <span className="badge-num">04</span> Upload file
                </legend>
                <div className="uploadRow">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="input fileInput"
                  />
                  <a
                    href="/Party_Balances_Template.xlsx"
                    download
                    className="pillLink"
                  >
                    Download template ↓
                  </a>
                </div>
              </fieldset>

              <button type="submit" disabled={loading} className="submit">
                {loading ? "Generating…" : "Generate confirmations →"}
              </button>
            </form>

            {error && <p className="error">{error}</p>}

            <p className="note">
              Expected columns: <strong>Party Name</strong> and{" "}
              <strong>Balance as on date</strong> (a few common variations are
              matched automatically too).
            </p>
          </div>

          <p className="footer">K.Vijayaraghavan and Associates LLP · Chartered Accountants</p>
        </main>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        html,
        body {
          margin: 0;
          padding: 0;
        }
        body {
          font-family: "Inter", system-ui, sans-serif;
          color: #14121f;
        }
        :focus-visible {
          outline: 2px solid #6c4cff;
          outline-offset: 2px;
        }
      `}</style>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #f5f3ff;
          display: flex;
          justify-content: center;
          padding: 56px 20px 40px;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.55;
          pointer-events: none;
        }
        .blob-a {
          width: 380px;
          height: 380px;
          background: #22d3a6;
          top: -140px;
          left: -120px;
        }
        .blob-b {
          width: 420px;
          height: 420px;
          background: #ff5fa0;
          bottom: -180px;
          right: -140px;
          opacity: 0.4;
        }

        .wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 620px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mark {
          font-family: "Space Grotesk", sans-serif;
          font-weight: 700;
          font-size: clamp(34px, 6vw, 46px);
          letter-spacing: -0.02em;
          display: flex;
          gap: 10px;
        }
        .mark-ink {
          color: #14121f;
        }
        .mark-grad {
          background: linear-gradient(90deg, #6c4cff, #ff5fa0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .eyebrow {
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6c4cff;
          margin: 6px 0 28px;
        }

        .card {
          width: 100%;
          background: #ffffff;
          border: 2.5px solid #14121f;
          border-radius: 22px;
          box-shadow: 8px 8px 0 #6c4cff;
          padding: 32px 30px 28px;
        }

        .lede {
          font-size: 14.5px;
          line-height: 1.55;
          color: #4a465c;
          margin: 0 0 26px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .group {
          border: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #14121f;
          padding: 0;
          margin-bottom: 2px;
        }
        .badge-num {
          background: #22d3a6;
          color: #072e26;
          border-radius: 999px;
          padding: 2px 8px;
          font-size: 11px;
        }

        .row {
          display: flex;
          gap: 10px;
        }
        .row .input {
          flex: 1;
        }

        .input {
          width: 100%;
          padding: 11px 13px;
          border: 2px solid #e4e1f5;
          border-radius: 12px;
          font-size: 14px;
          font-family: "Inter", sans-serif;
          background: #fbfaff;
          color: #14121f;
          transition: border-color 0.15s ease;
        }
        .input::placeholder {
          color: #9490ab;
        }
        .input:focus {
          border-color: #6c4cff;
          outline: none;
        }

        .textarea {
          min-height: 58px;
          resize: vertical;
        }

        .dateLabel {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          color: #6a6580;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .uploadRow {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .fileInput {
          flex: 1;
          min-width: 180px;
          padding: 9px 10px;
        }

        .pillLink {
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          background: #fff1f8;
          color: #d6266f;
          border: 2px solid #ff5fa0;
          border-radius: 999px;
          padding: 8px 14px;
          text-decoration: none;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
          box-shadow: 3px 3px 0 #ff5fa0;
        }
        .pillLink:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0 #ff5fa0;
        }
        .pillLink:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 #ff5fa0;
        }

        .submit {
          margin-top: 4px;
          padding: 14px 18px;
          border: 2.5px solid #14121f;
          border-radius: 14px;
          background: #6c4cff;
          color: #fff;
          font-family: "Space Grotesk", sans-serif;
          font-size: 15.5px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 5px 5px 0 #14121f;
          transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease;
        }
        .submit:hover:not(:disabled) {
          transform: translate(-2px, -2px);
          box-shadow: 7px 7px 0 #14121f;
        }
        .submit:active:not(:disabled) {
          transform: translate(1px, 1px);
          box-shadow: 2px 2px 0 #14121f;
        }
        .submit:disabled {
          background: #b7abff;
          cursor: not-allowed;
          box-shadow: 5px 5px 0 #ded9ff;
        }

        .hint {
          font-size: 12px;
          color: #837f96;
          margin: 0;
        }

        .error {
          margin-top: 16px;
          font-size: 13.5px;
          color: #c0392b;
          background: #fdecea;
          border: 1.5px solid #f3b9b3;
          border-radius: 10px;
          padding: 10px 12px;
        }

        .note {
          margin-top: 20px;
          font-size: 12.5px;
          color: #6a6580;
          background: #f6f4ff;
          border-radius: 10px;
          padding: 12px 14px;
          line-height: 1.5;
        }

        .footer {
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          color: #8b87a0;
          margin-top: 22px;
          letter-spacing: 0.02em;
        }

        @media (max-width: 480px) {
          .row {
            flex-direction: column;
          }
          .card {
            padding: 26px 20px 22px;
          }
        }
      `}</style>
    </>
  );
}
