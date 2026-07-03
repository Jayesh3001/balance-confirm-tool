import { useEffect, useRef, useState } from "react";

const CAT_WIDTH = 46;

function Cat({ x, isMoving }) {
  return (
    <div
      className={"cat" + (isMoving ? " cat--walking" : " cat--idle")}
      style={{ transform: `translateX(${x}px)` }}
    >
      <svg width="46" height="30" viewBox="0 0 46 30" fill="none">
        {/* tail */}
        <path
          className="catTail"
          d="M6 20 C -2 16, -2 6, 7 4"
          stroke="#1c1f1d"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* body */}
        <ellipse cx="22" cy="19" rx="13" ry="8" fill="#1c1f1d" />
        {/* head */}
        <circle cx="35" cy="12" r="7" fill="#1c1f1d" />
        {/* ears */}
        <path d="M30 7 L31.5 1 L35 6 Z" fill="#1c1f1d" />
        <path d="M39 6 L40.5 1 L42 7 Z" fill="#1c1f1d" />
        {/* inner ears */}
        <path d="M31.3 5.3 L32 2.3 L33.6 5 Z" fill="#0f9d6c" />
        {/* eye */}
        <circle className="catEye" cx="37.5" cy="12" r="1.15" fill="#faf8f3" />
        {/* legs */}
        <rect className="legA" x="14" y="24" width="2.4" height="5" rx="1.2" fill="#1c1f1d" />
        <rect className="legB" x="20" y="24" width="2.4" height="5" rx="1.2" fill="#1c1f1d" />
        <rect className="legC" x="26" y="24" width="2.4" height="5" rx="1.2" fill="#1c1f1d" />
        <rect className="legD" x="31" y="24" width="2.4" height="5" rx="1.2" fill="#1c1f1d" />
      </svg>
    </div>
  );
}

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

  const [catX, setCatX] = useState(40);
  const [catMoving, setCatMoving] = useState(false);
  const idleTimer = useRef(null);

  useEffect(() => {
    setCatX(Math.max(8, window.innerWidth / 2 - CAT_WIDTH / 2));

    function handleMove(e) {
      const clamped = Math.min(
        Math.max(e.clientX - CAT_WIDTH / 2, 8),
        window.innerWidth - CAT_WIDTH - 8
      );
      setCatX(clamped);
      setCatMoving(true);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setCatMoving(false), 300);
    }

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

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
    <>
      <div className="roof">
        <Cat x={catX} isMoving={catMoving} />
      </div>

      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>
            <span style={styles.titleKva}>KVA</span>{" "}
            <span style={styles.titleOptimus}>OPTIMUS</span>
          </h1>
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

      <style jsx global>{`
        .roof {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 30px;
          pointer-events: none;
          z-index: 50;
        }
        .cat {
          position: absolute;
          top: 0;
          transition: transform 90ms linear;
        }
        .cat--walking .legA {
          animation: legSwing 0.28s ease-in-out infinite;
        }
        .cat--walking .legB {
          animation: legSwing 0.28s ease-in-out infinite 0.14s;
        }
        .cat--walking .legC {
          animation: legSwing 0.28s ease-in-out infinite 0.07s;
        }
        .cat--walking .legD {
          animation: legSwing 0.28s ease-in-out infinite 0.21s;
        }
        .cat--walking svg {
          animation: bob 0.28s ease-in-out infinite;
        }
        @keyframes legSwing {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-1.6px);
          }
        }
        @keyframes bob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-0.8px);
          }
        }
        .cat--idle .catTail {
          animation: tailSwish 2.4s ease-in-out infinite;
          transform-origin: 7px 4px;
        }
        .cat--idle .catEye {
          animation: blink 3.6s ease-in-out infinite;
          transform-origin: 37.5px 12px;
        }
        @keyframes tailSwish {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(6deg);
          }
        }
        @keyframes blink {
          0%,
          92%,
          100% {
            transform: scaleY(1);
          }
          96% {
            transform: scaleY(0.15);
          }
        }
      `}</style>
    </>
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
  title: {
    fontSize: "clamp(28px, 4vw, 36px)",
    fontWeight: 800,
    letterSpacing: "-0.01em",
    marginBottom: 8,
    textAlign: "center",
  },
  titleKva: {
    color: "#1c1f1d",
  },
  titleOptimus: {
    fontWeight: 900,
    backgroundImage: "linear-gradient(135deg, #14231c, #0f9d6c 55%, #1c1f1d)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  },
  subtitle: {
    fontSize: 14,
    color: "#6f6b5e",
    lineHeight: 1.5,
    marginBottom: 24,
    textAlign: "center",
  },
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
