import { useEffect, useState } from "react";
import Head from "next/head";
import { FileText, Upload, Download, LayoutGrid } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
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

  function handleDrag(e, active) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }

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
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <title>KVA OPTIMUS</title>
      </Head>

      <div className="page">
        <header className="topbar">
          <div className="brand">
            <div className="logoMark">
              <LayoutGrid size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div className="brandTitle">KVA OPTIMUS</div>
              <div className="brandSub">
                / Trade Payables &amp; Receivables → Audit Confirmation Letters
              </div>
            </div>
          </div>
          <div className="tags">
            <span className="tag tag-a">Payables</span>
            <span className="tag tag-b">Receivables</span>
          </div>
        </header>

        <main className="content">
          <section className="step">
            <div className="stepLabel">STEP 1 — SELECT LETTER FORMAT</div>
            <div className="formatGrid">
              {templatesList.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={
                    "formatCard" + (templateId === t.id ? " formatCard--active" : "")
                  }
                >
                  <div className="formatTop">
                    <div className="formatIcon">
                      <FileText size={20} strokeWidth={2} />
                    </div>
                    <span className="formatTag">
                      {t.id.startsWith("payables") ? "Trade Payables" : "Trade Receivables"}
                    </span>
                  </div>
                  <div className="formatName">{t.label}</div>
                  <div className="formatDesc">{t.description}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="step">
            <div className="stepLabel">STEP 2 — CLIENT (AUDITEE) DETAILS</div>
            <div className="card">
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
            </div>
          </section>

          <section className="step">
            <div className="stepLabel">STEP 3 — AUDIT PERIOD &amp; CONFIRMATION DATE</div>
            <div className="card">
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
            </div>
          </section>

          <section className="step">
            <div className="stepLabel">STEP 4 — UPLOAD PARTY &amp; BALANCE FILE</div>
            <label
              htmlFor="fileInput"
              className={"dropzone" + (dragActive ? " dropzone--active" : "")}
              onDragOver={(e) => handleDrag(e, true)}
              onDragEnter={(e) => handleDrag(e, true)}
              onDragLeave={(e) => handleDrag(e, false)}
              onDrop={handleDrop}
            >
              <input
                id="fileInput"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="hiddenInput"
              />
              <div className="dropIcon">
                <Upload size={22} strokeWidth={2} />
              </div>
              <div className="dropTitle">
                {file ? file.name : "Drop your Excel file here"}
              </div>
              <div className="dropSub">
                Must contain columns named <strong>Party Name</strong> and{" "}
                <strong>Balance as on date</strong>
              </div>
              <div className="dropRow">
                <span className="fileTag">.xlsx</span>
                <span className="fileTag">.xls</span>
                <span className="fileTag">.csv</span>
              </div>
              <a
                href="/Party_Balances_Template.xlsx"
                download
                onClick={(e) => e.stopPropagation()}
                className="downloadLink"
              >
                <Download size={13} strokeWidth={2.2} />
                Download Excel template
              </a>
            </label>
          </section>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="submit"
          >
            {loading ? "Generating…" : "Generate Balance Confirmations"}
          </button>

          {error && <p className="error">{error}</p>}
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
          background: #faf8f3;
        }
        :focus-visible {
          outline: 2px solid #0f9d6c;
          outline-offset: 2px;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #faf8f3;
          color: #1c1f1d;
        }

        .topbar {
          background: #fff;
          border-bottom: 1px solid #eae6db;
          padding: 18px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logoMark {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #dff5ea;
          color: #0b6b4c;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .brandTitle {
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.01em;
        }
        .brandSub {
          font-size: 12.5px;
          color: #8a8676;
          margin-top: 1px;
        }
        .tags {
          display: flex;
          gap: 8px;
        }
        .tag {
          font-size: 12px;
          font-weight: 600;
          padding: 5px 12px;
          border-radius: 999px;
        }
        .tag-a {
          background: #dff5ea;
          color: #0b6b4c;
        }
        .tag-b {
          background: #eef1e4;
          color: #556b2f;
        }

        .content {
          max-width: 760px;
          margin: 0 auto;
          padding: 36px 24px 60px;
        }

        .step {
          margin-bottom: 30px;
        }
        .stepLabel {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #8a8676;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .card {
          background: #fff;
          border: 1px solid #eae6db;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .formatGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }
        .formatCard {
          text-align: left;
          background: #fff;
          border: 1.5px solid #eae6db;
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          font-family: inherit;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .formatCard:hover {
          border-color: #b9e3cd;
        }
        .formatCard--active {
          border-color: #0f9d6c;
          box-shadow: 0 0 0 1px #0f9d6c;
        }
        .formatTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .formatIcon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #f3f1e8;
          color: #556b2f;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .formatCard--active .formatIcon {
          background: #dff5ea;
          color: #0b6b4c;
        }
        .formatTag {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #8a8676;
          background: #f3f1e8;
          padding: 3px 8px;
          border-radius: 999px;
        }
        .formatName {
          font-weight: 600;
          font-size: 14.5px;
          margin-bottom: 4px;
        }
        .formatDesc {
          font-size: 12.5px;
          color: #8a8676;
          line-height: 1.45;
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
          padding: 10px 12px;
          border: 1px solid #e2ddd0;
          border-radius: 9px;
          font-size: 14px;
          font-family: inherit;
          background: #fdfcf9;
          color: #1c1f1d;
          transition: border-color 0.15s ease;
        }
        .input::placeholder {
          color: #a6a294;
        }
        .input:focus {
          border-color: #0f9d6c;
          outline: none;
        }
        .textarea {
          min-height: 56px;
          resize: vertical;
        }
        .dateLabel {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 12px;
          color: #6f6b5e;
        }

        .dropzone {
          display: block;
          background: #fff;
          border: 1.5px dashed #d9d3c2;
          border-radius: 14px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .dropzone--active {
          border-color: #0f9d6c;
          background: #f5fbf8;
        }
        .hiddenInput {
          display: none;
        }
        .dropIcon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #dff5ea;
          color: #0b6b4c;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        }
        .dropTitle {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }
        .dropSub {
          font-size: 12.5px;
          color: #8a8676;
          margin-bottom: 14px;
        }
        .dropRow {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .fileTag {
          font-size: 11px;
          color: #8a8676;
          background: #f3f1e8;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .downloadLink {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: #0b6b4c;
          text-decoration: none;
          border-bottom: 1px solid #b9e3cd;
          padding-bottom: 1px;
        }

        .submit {
          width: 100%;
          padding: 14px 18px;
          border: none;
          border-radius: 12px;
          background: #0f9d6c;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .submit:hover:not(:disabled) {
          background: #0b6b4c;
        }
        .submit:disabled {
          background: #a9d9c4;
          cursor: not-allowed;
        }

        .error {
          margin-top: 14px;
          font-size: 13.5px;
          color: #b3261e;
          background: #fbeceb;
          border: 1px solid #f2c4c0;
          border-radius: 10px;
          padding: 10px 12px;
        }

        @media (max-width: 560px) {
          .row {
            flex-direction: column;
          }
          .topbar {
            padding: 16px 20px;
          }
        }
      `}</style>
    </>
  );
}
